'use client';
import Link from 'next/link';
import { Star, Plus, Check, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

export default function MovieCard({ movie }) {
    const { user } = useUser();
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    // 1. Check if saved
    useEffect(() => {
        if (!user || !movie) return;
        const validId = movie.tmdbId || movie.id;
        
        axios.get(`${API_BASE_URL}/api/watchlist/${user.id}/${validId}`)
            .then(res => setSaved(res.data.saved))
            .catch(err => console.error(err));
    }, [user, movie]);

    // 2. Handle Click
    const handleWatchlistClick = async (e) => {
        // 🛑 This prevents any parent clicks
        e.preventDefault(); 
        e.stopPropagation(); 

        if (!user) return alert("Please sign in to save movies!");
        
        const validId = Number(movie.tmdbId || movie.id);
        console.log("Card Clicked for:", validId); // Debug Log

        setLoading(true);
        try {
            if (saved) {
                await axios.delete(`${API_BASE_URL}/api/watchlist/${user.id}/${validId}`);
                setSaved(false);
            } else {
                await axios.post(`${API_BASE_URL}/api/watchlist`, {
                    userId: user.id,
                    movie: {
                        tmdbId: validId,
                        title: movie.title || movie.name,
                        poster_path: movie.poster_path,
                        vote_average: movie.vote_average,
                        type: movie.type || 'movie'
                    }
                });
                setSaved(true);
            }
        } catch (err) {
            console.error("Card Action Failed:", err);
        }
        setLoading(false);
    };

    // Determine the ID to link to
    const linkId = movie.tmdbId || movie.id;
    const linkType = movie.type || 'movie';

    return (
        <div className="relative group aspect-[2/3] bg-gray-900 rounded-xl overflow-hidden hover:scale-105 transition duration-300 shadow-lg hover:shadow-2xl hover:z-20">
            
            {/* 1. THE LINK (Wraps only the content, NOT the button) */}
            <Link href={`/movie/${linkId}?type=${linkType}`} className="block w-full h-full">
                
                {/* Poster */}
                <img 
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.jpg'} 
                    alt={movie.title || movie.name} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                    loading="lazy"
                />

                {/* Text Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
                    <h3 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-2">
                        {movie.title || movie.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-300">
                        <span className="flex items-center gap-1 text-yellow-400 font-bold">
                            <Star size={10} fill="currentColor" /> {movie.vote_average?.toFixed(1)}
                        </span>
                        <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                    </div>
                </div>
            </Link>

            {/* 2. THE BUTTON (Separate Sibling, sitting on top) */}
            <button 
                onClick={handleWatchlistClick}
                disabled={loading}
                className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-50 shadow-lg cursor-pointer ${
                    saved 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-black/50 text-white hover:bg-white hover:text-black opacity-0 group-hover:opacity-100'
                }`}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Plus size={16} />}
            </button>

        </div>
    );
}