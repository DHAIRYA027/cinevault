const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const NodeCache = require('node-cache'); // ⚡️ 1. Cache Library

// Models
const Watchlist = require('./models/Watchlist'); 
const Movie = require('./models/Movie');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.TMDB_API_KEY;

// ⚡️ 2. Setup Cache (TTL = 3600 seconds = 1 Hour)
const cache = new NodeCache({ stdTTL: 3600 });

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

// 1. Get All Movies (Home Page) - ⚡️ WITH CACHE
app.get('/api/movies', async (req, res) => {
  // Check Cache First
  const cachedData = cache.get("all_movies");
  if (cachedData) return res.json(cachedData);

  // If not in cache, fetch from DB
  const movies = await Movie.find({}); 
  
  // Save to Cache for next time
  cache.set("all_movies", movies);
  
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

// 3. Get Movie/TV Details - ⚡️ UPDATED FIX FOR "N/A"
app.get('/api/movies/:id', async (req, res) => {
  const { id } = req.params;
  
  // 1. Force correct type logic (Fixes Anime/TV detection)
  const queryType = req.query.type;
  let type = 'movie'; 
  if (queryType === 'tv' || queryType === 'anime') type = 'tv';

  // 2. Check Cache
  const cacheKey = `movie_${id}_${type}`;
  const cachedMovie = cache.get(cacheKey);
  if (cachedMovie) return res.json(cachedMovie);

  try {
    let movieData = null;
    // Check if ID is a Mongo Object ID (local DB fetch)
    if (mongoose.Types.ObjectId.isValid(id)) {
        movieData = await Movie.findById(id);
    }
    
    // If not found by Mongo ID, or it was a TMDB ID, define query
    if (!movieData) {
        const query = { tmdbId: id };
        if (req.query.type) query.type = type;
        movieData = await Movie.findOne(query);
    }

    // 3. Fetch from TMDB (Using correct endpoint: 'tv' or 'movie')
    const endpointType = type === 'tv' ? 'tv' : 'movie';
    // Use the TMDB ID from local DB if available, otherwise assume param is TMDB ID
    const lookupId = movieData?.tmdbId || id;

    const tmdbRes = await fetchWithRetry(`https://api.themoviedb.org/3/${endpointType}/${lookupId}`, { 
      api_key: API_KEY,
      append_to_response: 'credits,recommendations,images,reviews,watch/providers,videos,external_ids' 
    });
    
    const data = tmdbRes.data;

    // 4. DATA NORMALIZATION (The Fix for "N/A")
    const isTv = type === 'tv';

    // A. Fix Director vs Creator
    const directors = isTv 
      ? data.created_by?.map(c => c.name) || [] 
      : data.credits?.crew?.filter(c => c.job === 'Director').map(c => c.name) || [];

    // B. Fix Writers
    const writers = data.credits?.crew
      ?.filter(c => ['Screenplay', 'Writer', 'Story', 'Creator'].includes(c.job))
      .map(c => c.name).slice(0, 3) || [];

    // C. Fix Trailer (Find YouTube Trailer)
    const trailer = data.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube") 
      || data.videos?.results?.find(v => v.site === "YouTube");

    // D. Prepare Database Update Object
    const updateData = {
        tmdbId: data.id,
        title: isTv ? data.name : data.title,
        overview: data.overview,
        tagline: data.tagline,
        poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
        backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
        
        // Fix Dates
        release_date: isTv ? data.first_air_date : data.release_date,
        releaseYear: (isTv ? data.first_air_date : data.release_date)?.substring(0, 4) || 'N/A',
        
        // Fix Runtime (TV uses array)
        runtime: isTv ? (data.episode_run_time?.[0] || 0) : data.runtime,
        
        vote_average: data.vote_average || 0,
        vote_count: data.vote_count,
        status: data.status,
        
        // Fix Budget (Set 0 for TV to hide it on frontend)
        budget: isTv ? 0 : (data.budget || 0),
        revenue: isTv ? 0 : (data.revenue || 0),
        
        original_language: data.original_language,
        type: type,
        seasons: isTv ? data.seasons : null,
        genres: data.genres?.map(g => g.name) || []
    };

    // 5. Update MongoDB
    movieData = await Movie.findOneAndUpdate(
        { tmdbId: data.id, type: type },
        { $set: updateData },
        { upsert: true, new: true }
    );

    // 6. Format Response for Frontend
    const formattedData = {
      ...updateData,
      _id: movieData._id,
      userReviews: movieData.userReviews || [],
      
      // Cast with Images
      cast: data.credits?.cast?.slice(0, 15).map(c => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
      })) || [],
      
      directors, 
      writers, 
      trailerKey: trailer?.key, 
      
      // Recommendations (Filtered)
      recommendations: data.recommendations?.results?.slice(0, 8).map(r => ({
        tmdbId: r.id, 
        title: r.title || r.name, 
        poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null, 
        vote_average: r.vote_average, 
        type: type 
      })).filter(i => i.poster_path),
      
      // Screenshots for Gallery
      screenshots: data.images?.backdrops?.slice(0, 6).map(img => `https://image.tmdb.org/t/p/original${img.file_path}`) || [],
      
      // TMDB Reviews
      reviews: data.reviews?.results?.slice(0, 5) || [],
      providers: data['watch/providers']?.results || {}
    };

    // 7. Save to Cache and Response
    cache.set(cacheKey, formattedData);
    res.json(formattedData);

  } catch (err) { 
      console.error("Backend Error:", err.message); 
      res.status(500).json({ error: "Sync failed" }); 
  }
});

// 4. Submit Review
app.post('/api/reviews/:tmdbId', async (req, res) => {
    try {
        const { tmdbId } = req.params;
        const { author, rating, content, type } = req.body;
        const review = { author: author || 'Anonymous', rating: Number(rating), content, date: new Date() };
        let updatedMovie = await Movie.findOneAndUpdate({ tmdbId: Number(tmdbId), type: type }, { $push: { userReviews: review } }, { new: true });
        if (!updatedMovie) updatedMovie = await Movie.findOneAndUpdate({ tmdbId: Number(tmdbId) }, { $push: { userReviews: review } }, { new: true });
        
        // Invalidate Cache so the new review shows up
        const cacheKey = `movie_${tmdbId}_${type}`;
        cache.del(cacheKey);

        if (updatedMovie) res.json(updatedMovie.userReviews);
        else res.status(404).json({ error: "Movie record not found" });
    } catch (err) { res.status(500).json({ error: "Failed to post review" }); }
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