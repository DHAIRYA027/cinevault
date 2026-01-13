'use client';
import Link from 'next/link';

export default function MovieCard({ movie, type }) {
  // 1. Determine Type (TV vs Movie) to prevent "N/A" errors
  const mediaType = type || movie.media_type || (movie.name ? 'tv' : 'movie');
  
  // 2. Formatting
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? releaseDate.substring(0, 4) : '';

  // 3. Watchlist Handler
  const handleAddToWatchlist = async (e) => {
    e.preventDefault(); // Stop link navigation
    e.stopPropagation(); // Stop bubbling
    
    // REPLACE THIS with your actual backend call or context
    console.log("Adding to watchlist:", movie.id); 
    
    // Example: 
    // await fetch('/api/watchlist', { method: 'POST', body: JSON.stringify({ ...movie, type: mediaType }) });
    alert(`${title} added to watchlist!`);
  };

  return (
    <Link href={`/movie/${movie.id}?type=${mediaType}`} className="group relative block">
      <div className="relative overflow-hidden rounded-lg shadow-lg bg-[#1F1F1F] aspect-[2/3] transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-red-900/20">
        
        {/* POSTER */}
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Image'
          }
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* HOVER OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            
            {/* Watchlist Button (Top Right) */}
            <button 
                onClick={handleAddToWatchlist}
                className="absolute top-2 right-2 bg-white/20 hover:bg-red-600 backdrop-blur-md p-2 rounded-full text-white transition-colors"
                title="Add to Watchlist"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {/* Info Text */}
            <h3 className="text-white font-bold text-sm leading-tight mb-1">{title}</h3>
            <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{year}</span>
                <span className="border border-gray-600 px-1 rounded uppercase text-[10px] tracking-wider">
                    {mediaType}
                </span>
            </div>
            
            <div className="flex items-center gap-1 mt-2 text-yellow-400 text-xs font-bold">
                <span>★</span>
                <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
            </div>
        </div>
      </div>
    </Link>
  );
}