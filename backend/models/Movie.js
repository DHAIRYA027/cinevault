const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true }, // Removed 'unique: true' to prevent ID collisions
  title: String,
  overview: String,
  poster_path: String,
  backdrop_path: String,
  release_date: String,
  vote_average: Number,
  type: String,
  genres: [Number],
  seasons: { type: mongoose.Schema.Types.Mixed }, // Allows flexible season data
  
  // 👇 NEW: Explicitly define the reviews array
  userReviews: [
    {
      author: String,
      rating: Number,
      content: String,
      date: { type: Date, default: Date.now }
    }
  ],
  
  addedAt: { type: Date, default: Date.now }
}, { strict: false });

// Compound index to ensure (tmdbId + type) is unique, not just tmdbId
MovieSchema.index({ tmdbId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Movie', MovieSchema);