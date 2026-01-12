const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: String,
  overview: String,
  tagline: String,           // ✨ NEW
  poster_path: String,
  backdrop_path: String,
  release_date: String,
  vote_average: Number,
  vote_count: Number,        // ✨ NEW
  status: String,            // ✨ NEW
  runtime: Number,           // ✨ NEW
  budget: Number,            // ✨ NEW
  revenue: Number,           // ✨ NEW
  original_language: String, // ✨ NEW
  type: { type: String, default: 'movie' },
  genres: [mongoose.Schema.Types.Mixed], // ✨ CHANGED: Accepts Strings ("Action") OR Numbers (28)
  cast: [
    {
      id: Number,
      name: String,
      character: String,
      profile_path: String,
    },
  ],
  directors: [String],
  writers: [String],
  trailerKey: String,
  seasons: Array, // For TV Shows
  recommendations: [
    {
      tmdbId: Number,
      title: String,
      poster_path: String,
      vote_average: Number,
      type: String,
    },
  ],
  screenshots: [String],
  userReviews: [
    {
      author: String,
      rating: Number,
      content: String,
      date: { type: Date, default: Date.now },
    },
  ],
  providers: { type: Object, default: {} } // Stores streaming links
});

module.exports = mongoose.model('Movie', MovieSchema);