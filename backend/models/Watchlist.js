const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Stores the Clerk User ID
  tmdbId: { type: Number, required: true },
  type: { type: String, default: 'movie' },
  title: String,
  poster_path: String,
  vote_average: Number,
  addedAt: { type: Date, default: Date.now }
});

// ⚠️ Prevents duplicates: A user cannot save the same movie twice
WatchlistSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', WatchlistSchema);