'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { normalizeMediaData } from '@/utils/mediaHelpers'; // Ensure you have the helper from previous steps!

export default function MovieDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'movie';
  const [media, setMedia] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=credits,videos,external_ids`);
      const data = await res.json();
      setMedia(normalizeMediaData(data, type));
    }
    fetchData();
  }, [id, type]);

  if (!media) return <div className="bg-[#1F1F1F] min-h-screen text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-white font-sans pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* --- 1. IMDB HEADER (Title / Year / Rating) --- */}
        <div className="flex justify-between items-start mb-6">
          <div>
             <h1 className="text-4xl md:text-5xl font-normal mb-2">{media.title}</h1>
             <div className="flex gap-4 text-gray-400 text-sm font-bold">
                <span className="text-gray-300">{media.type === 'tv' ? 'TV Series' : 'Movie'}</span>
                <span className="text-gray-300">•</span>
                <span>{media.releaseYear}</span>
                <span className="text-gray-300">•</span>
                <span>{media.rating} Rating</span>
                <span className="text-gray-300">•</span>
                <span>{media.runtime}</span>
             </div>
          </div>
          
          {/* RATING BOX (Top Right) */}
          <div className="hidden md:flex flex-col items-center">
             <div className="text-gray-400 text-xs tracking-widest uppercase font-bold mb-1">IMDb RATING</div>
             <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-4xl">★</span>
                <div className="flex flex-col">
                   <span className="text-xl font-bold text-white">{media.rating}/10</span>
                </div>
             </div>
          </div>
        </div>

        {/* --- 2. THE MEDIA GRID (Poster | Trailer | Sidebar) --- */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_250px] gap-2 mb-8">
           
           {/* COL 1: POSTER */}
           <div className="relative">
              <img src={media.poster} alt={media.title} className="w-full rounded shadow-lg" />
              {/* Mobile Watchlist Button (only visible on small screens) */}
              <button className="md:hidden mt-2 w-full bg-[#2C2C2C] text-blue-400 py-2 font-bold rounded flex items-center justify-center gap-2">
                 + Add to Watchlist
              </button>
           </div>

           {/* COL 2: TRAILER / VIDEO HERO */}
           <div className="bg-black flex items-center justify-center relative min-h-[400px]">
              {media.trailerKey ? (
                 <iframe 
                   className="w-full h-full absolute inset-0"
                   src={`https://www.youtube.com/embed/${media.trailerKey}?autoplay=0&controls=1`}
                   allowFullScreen
                 ></iframe>
              ) : (
                 <div className="flex flex-col items-center gap-4 text-gray-500">
                    <span className="text-4xl">🎬</span>
                    <p>No Trailer Available</p>
                 </div>
              )}
           </div>

           {/* COL 3: QUICK ACTIONS SIDEBAR */}
           <div className="hidden md:flex flex-col gap-2">
              <div className="bg-[#2C2C2C] p-4 rounded h-full flex flex-col gap-4">
                 <div className="bg-[#383838] p-3 rounded flex items-center gap-3 cursor-pointer hover:bg-[#424242] transition">
                    <div className="bg-yellow-500 text-black p-1 rounded font-bold text-xs">Videos</div>
                    <span className="font-bold text-sm">3 Videos</span>
                 </div>
                 <div className="bg-[#383838] p-3 rounded flex items-center gap-3 cursor-pointer hover:bg-[#424242] transition">
                    <div className="bg-yellow-500 text-black p-1 rounded font-bold text-xs">Photos</div>
                    <span className="font-bold text-sm">12 Photos</span>
                 </div>
              </div>
           </div>
        </div>

        {/* --- 3. MAIN ACTION & SYNOPSIS --- */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">
           
           {/* LEFT COLUMN: Story & Cast */}
           <div>
              {/* Categories / Genres Chips */}
              <div className="flex gap-2 mb-6">
                 <span className="border border-gray-600 rounded-full px-4 py-1 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer">Action</span>
                 <span className="border border-gray-600 rounded-full px-4 py-1 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer">Adventure</span>
                 <span className="border border-gray-600 rounded-full px-4 py-1 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer">Animation</span>
              </div>

              <p className="text-lg leading-relaxed text-white mb-8">
                 {media.overview}
              </p>

              <div className="border-t border-gray-700 py-4">
                 <span className="font-bold mr-2 text-white">Director</span>
                 <span className="text-blue-400">{media.director}</span>
              </div>
              <div className="border-t border-gray-700 py-4">
                 <span className="font-bold mr-2 text-white">Status</span>
                 <span className="text-blue-400">{media.status || 'Released'}</span>
              </div>
              
              {/* SEASONS (If TV) */}
              {media.seasons && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-yellow-500 mb-4 border-l-4 border-yellow-500 pl-3">Seasons</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {media.seasons.map(season => (
                      <div key={season.id} className="min-w-[120px] text-center">
                        <img src={`https://image.tmdb.org/t/p/w200${season.poster_path}`} className="rounded mb-2"/>
                        <p className="text-sm font-bold">{season.name}</p>
                        <p className="text-xs text-gray-500">{season.episode_count} Eps</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </div>

           {/* RIGHT COLUMN: Watchlist Button (Sticky) */}
           <div>
              <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg py-3 rounded flex items-center justify-center gap-2 mb-4 transition">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                 Add to Watchlist
              </button>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded">
                 <h4 className="font-bold text-yellow-500 mb-2">My Review</h4>
                 <p className="text-sm text-gray-400 mb-4">You haven't rated this yet.</p>
                 <button className="text-blue-400 text-sm font-bold hover:underline">Rate this now</button>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}