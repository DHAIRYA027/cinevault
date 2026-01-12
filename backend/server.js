const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Models
const Watchlist = require('./models/Watchlist'); 
const Movie = require('./models/Movie');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.TMDB_API_KEY;

app.use(cors());
app.use(express.json());

// Helper: Retry logic for TMDB API stability
const fetchWithRetry = async (url, params = {}, retries = 3) => {
  try {
    return await axios.get(url, { params });
  } catch (err) {
    if (retries > 0 && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
      await new Promise(r => setTimeout(r, 1500)); 
      return fetchWithRetry(url, params, retries - 1);
    }
    throw err;
  }
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('✅ Connected to MongoDB');
  try { await Movie.collection.dropIndex('tmdbId_1'); } catch (e) {}
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});

// --- ROUTES ---

// 1. Get All Movies (Home Page)
app.get('/api/movies', async (req, res) => {
  const movies = await Movie.find({}); 
  res.json(movies);
});

// 2. Search
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        const response = await fetchWithRetry(`https://api.themoviedb.org/3/search/multi`, { 
            api_key: API_KEY, query: q, include_adult: false
        });
        const filtered = response.data.results
            .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
            .slice(0, 10);
        res.json(filtered);
    } catch (err) { res.status(500).json({ error: "Search failed" }); }
});

// 3. Get Movie Details (UPDATED WITH MORE DATA)
app.get('/api/movies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let movieData = null;
    if (mongoose.Types.ObjectId.isValid(id)) movieData = await Movie.findById(id);
    if (!movieData) {
        const query = { tmdbId: id };
        if (req.query.type) query.type = req.query.type;
        movieData = await Movie.findOne(query);
    }
    const type = req.query.type || (movieData ? movieData.type : 'movie');
    const endpointType = (type === 'anime' || type === 'tv') ? 'tv' : 'movie';
    const lookupId = movieData?.tmdbId || id;

    const tmdbRes = await fetchWithRetry(`https://api.themoviedb.org/3/${endpointType}/${lookupId}`, { 
      api_key: API_KEY,
      append_to_response: 'credits,recommendations,images,reviews,watch/providers,videos' 
    });
    
    const liveItem = tmdbRes.data;
    const directors = liveItem.credits?.crew?.filter(c => c.job === 'Director').map(c => c.name) || [];
    const writers = liveItem.credits?.crew?.filter(c => ['Screenplay', 'Writer', 'Story', 'Creator'].includes(c.job)).map(c => c.name).slice(0, 3) || [];
    const trailer = liveItem.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube") || liveItem.videos?.results?.[0];

    // 👇 NEW: Capturing extensive details
    const updateData = {
        tmdbId: liveItem.id,
        title: liveItem.title || liveItem.name,
        overview: liveItem.overview,
        tagline: liveItem.tagline, // ✨ NEW
        poster_path: liveItem.poster_path ? `https://image.tmdb.org/t/p/w500${liveItem.poster_path}` : null,
        backdrop_path: liveItem.backdrop_path ? `https://image.tmdb.org/t/p/original${liveItem.backdrop_path}` : null,
        release_date: liveItem.release_date || liveItem.first_air_date,
        vote_average: liveItem.vote_average,
        vote_count: liveItem.vote_count, // ✨ NEW
        status: liveItem.status,         // ✨ NEW
        runtime: liveItem.runtime || liveItem.episode_run_time?.[0], // ✨ NEW
        budget: liveItem.budget,         // ✨ NEW
        revenue: liveItem.revenue,       // ✨ NEW
        original_language: liveItem.original_language, // ✨ NEW
        type: type,
        seasons: liveItem.seasons,
        genres: liveItem.genres?.map(g => g.name) || [] // ✨ Names instead of IDs
    };

    movieData = await Movie.findOneAndUpdate(
        { tmdbId: liveItem.id, type: type },
        { $set: updateData },
        { upsert: true, new: true }
    );

    const formattedData = {
      ...updateData,
      _id: movieData._id,
      userReviews: movieData.userReviews || [],
      cast: liveItem.credits?.cast?.slice(0, 10) || [],
      directors, writers, trailerKey: trailer?.key, 
      recommendations: liveItem.recommendations?.results?.slice(0, 10).map(r => ({
        tmdbId: r.id, title: r.title || r.name, poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null, vote_average: r.vote_average, type: type
      })).filter(i => i.poster_path),
      screenshots: liveItem.images?.backdrops?.slice(0, 6).map(img => `https://image.tmdb.org/t/p/original${img.file_path}`),
      reviews: liveItem.reviews?.results?.slice(0, 5),
      providers: liveItem['watch/providers']?.results || {}
    };
    res.json(formattedData);
  } catch (err) { res.status(500).json({ error: "Sync failed" }); }
});

// 4. Submit Review
app.post('/api/reviews/:tmdbId', async (req, res) => {
    try {
        const { tmdbId } = req.params;
        const { author, rating, content, type } = req.body;
        const review = { author: author || 'Anonymous', rating: Number(rating), content, date: new Date() };
        let updatedMovie = await Movie.findOneAndUpdate({ tmdbId: Number(tmdbId), type: type }, { $push: { userReviews: review } }, { new: true });
        if (!updatedMovie) updatedMovie = await Movie.findOneAndUpdate({ tmdbId: Number(tmdbId) }, { $push: { userReviews: review } }, { new: true });
        if (updatedMovie) res.json(updatedMovie.userReviews);
        else res.status(404).json({ error: "Movie record not found" });
    } catch (err) { res.status(500).json({ error: "Failed to post review" }); }
});

// 5. Get Trailer
app.get('/api/trailer/:tmdbId', async (req, res) => {
    try {
      const { tmdbId } = req.params;
      let type = req.query.type === 'anime' ? 'tv' : req.query.type || 'movie';
      const response = await fetchWithRetry(`https://api.themoviedb.org/3/${type}/${tmdbId}/videos`, { api_key: API_KEY });
      const trailer = response.data.results.find(v => v.site === "YouTube" && v.type === "Trailer") || response.data.results[0];
      if (trailer) res.json({ key: trailer.key }); else res.status(404).json({ error: "No trailer" });
    } catch (err) { res.status(404).json({ error: "Trailer unavailable" }); }
});

// 6. Get Person/Actor
app.get('/api/person/:id', async (req, res) => {
    try {
      const response = await fetchWithRetry(`https://api.themoviedb.org/3/person/${req.params.id}?append_to_response=combined_credits,external_ids`, { api_key: API_KEY });
      const credits = response.data.combined_credits.cast.filter(m => m.poster_path).sort((a, b) => b.popularity - a.popularity).slice(0, 20);
      res.json({ ...response.data, known_for: credits });
    } catch (err) { res.status(500).json({ error: "Failed to fetch person" }); }
});

// 7. Get TV Season
app.get('/api/tv/:id/season/:seasonNumber', async (req, res) => {
    try {
      const response = await fetchWithRetry(`https://api.themoviedb.org/3/tv/${req.params.id}/season/${req.params.seasonNumber}`, { api_key: API_KEY });
      res.json(response.data);
    } catch (err) { res.status(500).json({ error: "Failed to fetch season" }); }
});

// 8. Get TV Episode
app.get('/api/tv/:id/season/:seasonNumber/episode/:episodeNumber', async (req, res) => {
    try {
      const { id, seasonNumber, episodeNumber } = req.params;
      const episodeRes = await fetchWithRetry(`https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`, { 
          api_key: API_KEY, append_to_response: 'images,credits,videos,external_ids'
      });
      const providerRes = await fetchWithRetry(`https://api.themoviedb.org/3/tv/${id}/watch/providers`, { api_key: API_KEY });
      const data = { ...episodeRes.data, providers: providerRes.data.results || {} };
      res.json(data);
    } catch (err) { res.status(500).json({ error: "Failed to fetch episode" }); }
});

// --- WATCHLIST ROUTES ---

// Add to Watchlist
app.post('/api/watchlist', async (req, res) => {
  try {
    const { userId, movie } = req.body;
    if (!userId || !movie || !movie.tmdbId) return res.status(400).json({ error: "Invalid data" });
    
    await Watchlist.findOneAndUpdate(
      { userId, tmdbId: movie.tmdbId }, 
      { ...movie, userId },             
      { upsert: true, new: true }       
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to add" }); }
});

// Remove from Watchlist
app.delete('/api/watchlist/:userId/:tmdbId', async (req, res) => {
  try {
    const { userId, tmdbId } = req.params;
    await Watchlist.findOneAndDelete({ userId, tmdbId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to remove" }); }
});

// Get User's Watchlist
app.get('/api/watchlist/:userId', async (req, res) => {
  try {
    const list = await Watchlist.find({ userId: req.params.userId }).sort({ addedAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ error: "Failed to fetch list" }); }
});

// Check if Saved
app.get('/api/watchlist/:userId/:tmdbId', async (req, res) => {
  try {
    const { userId, tmdbId } = req.params;
    const exists = await Watchlist.exists({ userId, tmdbId });
    res.json({ saved: !!exists });
  } catch (err) { res.json({ saved: false }); }
});