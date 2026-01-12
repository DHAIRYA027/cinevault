import Link from 'next/link';
import { Star, Plus, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

const MovieCard = ({ movie }) => {
  const [added, setAdded] = useState(false);

  // Check if movie is already in list on load
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('myList')) || [];
    // Check by ID (support both _id and tmdbId for compatibility)
    const exists = saved.some(m => (m.tmdbId === movie.tmdbId) || (m._id === movie._id));
    if (exists) setAdded(true);
  }, [movie]);

  const toggleList = (e) => {
    e.preventDefault(); // Prevent clicking the link when clicking the button
    const saved = JSON.parse(localStorage.getItem('myList')) || [];
    
    if (added) {
      // Remove
      const filtered = saved.filter(m => (m.tmdbId !== movie.tmdbId) && (m._id !== movie._id));
      localStorage.setItem('myList', JSON.stringify(filtered));
      setAdded(false);
    } else {
      // Add
      localStorage.setItem('myList', JSON.stringify([...saved, movie]));
      setAdded(true);
    }
    // If we are on the Watchlist page, force a storage event or state update (handled by parent in that case)
    if (window.location.pathname === '/watchlist') {
       window.location.reload(); // Simple refresh to update UI immediately
    }
  };

  return (
    <Link href={`/movie/${movie.tmdbId || movie._id}`}>
      <div className="relative group bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 hover:border-cyan-400 transition-all cursor-pointer h-full shadow-lg">
        <div className="aspect-[2/3] overflow-hidden">
            <img 
              src={movie.poster_path ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) : '/placeholder.jpg'} 
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
              alt={movie.title} 
            />
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition" />

        {/* Add/Check Button */}
        <button 
            onClick={toggleList}
            className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all z-20 ${
                added ? 'bg-green-500 text-black' : 'bg-black/50 text-white hover:bg-cyan-500 hover:text-black'
            }`}
        >
            {added ? <Check size={14} strokeWidth={4} /> : <Plus size={14} strokeWidth={4} />}
        </button>

        {/* Text Info */}
        <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition duration-300">
          <h3 className="font-black text-sm text-white leading-tight line-clamp-2 drop-shadow-md mb-1">{movie.title || movie.name}</h3>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-yellow-400 flex items-center gap-1"><Star size={10} fill="currentColor" /> {movie.vote_average?.toFixed(1)}</span>
            <span className="text-gray-400">•</span>
            <span className="text-cyan-400 uppercase">{movie.type === 'tv' || movie.type === 'anime' ? 'TV' : 'Movie'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;