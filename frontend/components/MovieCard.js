// frontend/components/MovieCard.js
import Link from 'next/link';

export default function MovieCard({ movie, type }) {
  // 1. Priority Logic to determine if it's TV or Movie
  // Priority A: Explicit 'type' prop passed from parent
  // Priority B: 'media_type' field from API (common in search results)
  // Priority C: TV shows have 'name', Movies have 'title'
  const mediaType = type || movie.media_type || (movie.name ? 'tv' : 'movie');

  // 2. Format the release date safely
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? releaseDate.substring(0, 4) : 'N/A';

  return (
    // 3. The LINK must include the query param ?type=...
    <Link href={`/movie/${movie.id}?type=${mediaType}`} className="group">
      <div className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer transition-transform duration-200 hover:scale-105 hover:z-10">
        
        {/* POSTER IMAGE */}
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : '/placeholder-image.jpg' // Add a placeholder if missing
          }
          alt={movie.title || movie.name}
          className="w-full h-auto object-cover"
        />

        {/* OVERLAY (Optional - keeps text readable) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-white font-bold text-sm truncate">{movie.title || movie.name}</h3>
            <div className="flex justify-between items-center text-xs text-gray-300 mt-1">
                <span>{year}</span>
                <span className="uppercase border border-gray-500 px-1 rounded text-[10px]">{mediaType}</span>
            </div>
        </div>
      </div>
    </Link>
  );
}