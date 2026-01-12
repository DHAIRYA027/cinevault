const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Movie = require('./models/Movie');

const API_KEY = process.env.TMDB_API_KEY;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => { console.error(err); process.exit(1); });

// Fetch 10 pages per category (Big Data)
const fetchData = async (endpoint, type, pages = 10) => {
  let allResults = [];
  try {
    for (let i = 1; i <= pages; i++) {
      process.stdout.write(`   Fetching ${type} page ${i}...\r`); // Cool loading effect
      const url = `https://api.themoviedb.org/3/${endpoint}`;
      const response = await axios.get(url, {
        params: { api_key: API_KEY, language: 'en-US', page: i }
      });
      
      const formatted = response.data.results.map(item => ({
        tmdbId: item.id,
        title: item.title || item.name,
        overview: item.overview,
        poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        release_date: item.release_date || item.first_air_date,
        vote_average: item.vote_average,
        genres: item.genre_ids,
        type: type
      })).filter(item => item.poster_path && item.backdrop_path);
      
      allResults = [...allResults, ...formatted];
    }
    console.log(`\n   ✅ Done fetching ${type}`);
    return allResults;
  } catch (error) {
    console.error(`Error fetching ${type}:`, error.message);
    return [];
  }
};

const seedDatabase = async () => {
  try {
    await Movie.deleteMany({});
    console.log('🗑️  Old data cleared.');

    // 1. Fetch Anime FIRST (so it gets priority over generic TV)
    const anime = await fetchData('discover/tv?with_genres=16&with_original_language=ja', 'anime');
    
    // 2. Fetch the rest
    const movies = await fetchData('movie/popular', 'movie');
    const tvShows = await fetchData('tv/popular', 'tv');
    
    // 3. Combine (Anime first in list)
    let allContent = [...anime, ...movies, ...tvShows];
    
    // 4. Deduplicate (Keep the first occurrence - which is now Anime!)
    allContent = Array.from(new Set(allContent.map(a => a.tmdbId)))
      .map(id => allContent.find(a => a.tmdbId === id));

    await Movie.insertMany(allContent);
    console.log(`🎉 Success! Added ${allContent.length} items to CineVault.`);
    mongoose.disconnect();
  } catch (error) {
    console.error(error);
    mongoose.disconnect();
  }
};

seedDatabase();