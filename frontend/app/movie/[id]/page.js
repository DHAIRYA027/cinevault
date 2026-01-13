'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { normalizeMediaData } from '@/utils/mediaHelpers'; 
import Link from 'next/link';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'movie'; 
  
  const [media, setMedia] = useState(null);
  const [reviews, setReviews] = useState([]); // State for reviews

  useEffect(() => {
    async function fetchData() {
      // Fetch Details AND Reviews in parallel
      const [detailsRes, reviewsRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=credits,videos`),
        fetch(`https://api.themoviedb.org/3/${type}/${id}/reviews?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
      ]);

      const data = await detailsRes.json();
      const reviewsData = await reviewsRes.json();
      
      setMedia(normalizeMediaData(data, type));
      setReviews(reviewsData.results || []);
    }
    if (id) fetchData();
  }, [id, type]);

  if (!media) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      
      {/* --- HERO SECTION (IMDb Style) --- */}
      <div className="relative w-full h-[600px]">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
            <img src={media.backdrop} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
            
            {/* Title */}
            <h1 className="text-6xl font-extrabold mb-4 tracking-tight">{media.title}</h1>
            
            {/* Metadata Row */}
            <div className="flex items-center gap-6 text-sm font-medium text-gray-300 mb-6">
                <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase">Type</span>
                    <span className="text-white capitalize">{media.type === 'tv' ? 'TV Series' : 'Movie'}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase">{media.type === 'tv' ? 'Creator' : 'Director'}</span>
                    <span className="text-white">{media.director}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase">Release</span>
                    <span className="text-white">{media.releaseYear}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase">Rating</span>
                    <span className="text-yellow-400 flex items-center gap-1">★ {media.rating}</span>
                </div>
            </div>

            {/* Overview */}
            <p className="max-w-3xl text-lg text-gray-300 leading-relaxed mb-8">
                {media.overview}
            </p>

            {/* Buttons (Restoring your exact buttons) */}
            <div className="flex items-center gap-4">
                <a 
                    href={`https://www.youtube.com/watch?v=${media.trailerKey}`} 
                    target="_blank"
                    className="bg-[#E50914] hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition flex items-center gap-2"
                >
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                   Watch Trailer
                </a>
                
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold border border-white/20 transition flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Add to List
                </button>
            </div>
        </div>
      </div>

      {/* --- CONTENT BODY --- */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {/* Seasons (Only if TV) */}
        {media.seasons && media.seasons.length > 0 && (
            <section>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                   <span className="w-1 h-8 bg-[#E50914] block rounded-full"></span> 
                   Seasons
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {media.seasons.map(season => (
                       season.poster_path && (
                        <div key={season.id} className="min-w-[160px] group cursor-pointer">
                            <div className="rounded-xl overflow-hidden mb-2 relative">
                                <img src={`https://image.tmdb.org/t/p/w300${season.poster_path}`} className="w-full h-auto transition group-hover:scale-105 duration-300"/>
                            </div>
                            <h4 className="font-bold text-gray-200">{season.name}</h4>
                            <p className="text-sm text-gray-500">{season.episode_count} Episodes</p>
                        </div>
                       )
                    ))}
                </div>
            </section>
        )}

        {/* --- AUDIENCE REVIEWS (Restored from Screenshot) --- */}
        <section>
             <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-green-500 block rounded-full"></span> 
                Audience Reviews
             </h3>
             
             {reviews.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.slice(0, 4).map(review => (
                        <div key={review.id} className="bg-[#1F1F1F] p-6 rounded-xl border border-gray-800">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-[#3B82F6]">{review.author}</h4>
                                <span className="bg-gray-800 px-2 py-1 rounded text-xs text-yellow-500 font-bold">★ {review.author_details?.rating || '?'} / 10</span>
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-4 leading-relaxed">
                                {review.content}
                            </p>
                            <a href={review.url} target="_blank" className="text-xs text-gray-500 mt-4 block hover:text-white transition">Read full review</a>
                        </div>
                    ))}
                 </div>
             ) : (
                 <p className="text-gray-500 italic">No reviews yet.</p>
             )}
        </section>

      </div>
    </div>
  );
}