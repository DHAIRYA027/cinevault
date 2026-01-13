'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { normalizeMediaData } from '@/utils/mediaHelpers'; // Import the helper

export default function MovieDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'movie'; // Read ?type=tv from URL
  
  const [media, setMedia] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Append credits and videos to one API call for speed
      const res = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=credits,videos`
      );
      const data = await res.json();
      
      // Use the helper to clean the data
      setMedia(normalizeMediaData(data, type));
    }
    if (id) fetchData();
  }, [id, type]);

  if (!media) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* HERO SECTION */}
      <div className="relative h-[70vh] w-full">
        {media.backdrop && (
           <img src={media.backdrop} className="w-full h-full object-cover opacity-40 absolute" />
        )}
        <div className="absolute bottom-0 left-0 p-10 w-full bg-gradient-to-t from-black via-transparent to-transparent">
          <h1 className="text-5xl font-bold mb-4">{media.title}</h1>
          
          <div className="flex gap-6 text-sm text-gray-300 uppercase font-bold mb-6">
             <span className="bg-red-600 px-2 py-1 rounded text-white">{media.type}</span>
             <span>{media.releaseYear}</span>
             <span>{media.runtime}</span>
             <span className="text-yellow-400">★ {media.rating}</span>
             {media.director !== "N/A" && <span>Created by: {media.director}</span>}
          </div>

          <p className="max-w-3xl text-lg text-gray-200 mb-8">{media.overview}</p>

          {/* WATCH BUTTONS */}
          <div className="flex gap-4">
            {media.trailerKey && (
              <a href={`https://www.youtube.com/watch?v=${media.trailerKey}`} target="_blank" className="bg-red-600 px-8 py-3 rounded-full font-bold flex items-center gap-2">
                ▶ Watch Trailer
              </a>
            )}
            {/* Add your existing Watchlist Button Component Here */}
          </div>
        </div>
      </div>

      {/* SEASONS SECTION (Only renders if seasons exist) */}
      {media.seasons && media.seasons.length > 0 && (
        <div className="px-10 mt-10">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-500 pl-3">Seasons</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {media.seasons.map(season => (
              season.poster_path && (
                <div key={season.id} className="min-w-[140px]">
                  <img src={`https://image.tmdb.org/t/p/w300${season.poster_path}`} className="rounded-lg mb-2"/>
                  <p className="text-sm font-bold text-center">{season.name}</p>
                  <p className="text-xs text-gray-500 text-center">{season.episode_count} Eps</p>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}