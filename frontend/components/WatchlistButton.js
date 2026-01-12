'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs'; // 👈 Gets the logged-in user
import axios from 'axios';
import { Plus, Check, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/config';

export default function WatchlistButton({ movie }) {
    const { user, isLoaded } = useUser();
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    // 1. Check if movie is already in list when page loads
    useEffect(() => {
        if (!user || !movie) return;
        // The API route we just made handles the check
        axios.get(`${API_BASE_URL}/api/watchlist/${user.id}/${movie.tmdbId}`)
            .then(res => setSaved(res.data.saved))
            .catch(err => console.error(err));
    }, [user, movie]);

    // 2. Handle Click (Add or Remove)
    const toggleWatchlist = async () => {
        if (!user) return alert("Please sign in to save movies!");
        
        setLoading(true);
        try {
            if (saved) {
                // Remove
                await axios.delete(`${API_BASE_URL}/api/watchlist/${user.id}/${movie.tmdbId}`);
                setSaved(false);
            } else {
                // Add
                await axios.post(`${API_BASE_URL}/api/watchlist`, {
                    userId: user.id,
                    movie: {
                        tmdbId: movie.tmdbId,
                        title: movie.title || movie.name,
                        poster_path: movie.poster_path,
                        vote_average: movie.vote_average,
                        type: movie.type || 'movie'
                    }
                });
                setSaved(true);
            }
        } catch (err) { 
            console.error(err);
            alert("Failed to update watchlist"); 
        }
        setLoading(false);
    };

    if (!isLoaded) return null; // Wait for Clerk to load

    return (
        <button 
            onClick={toggleWatchlist} 
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95 ${
                saved 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30' 
                : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
            }`}
        >
            {loading ? <Loader2 className="animate-spin" size={20} /> : saved ? <Check size={20} /> : <Plus size={20} />}
            {saved ? 'In Watchlist' : 'Add to List'}
        </button>
    );
}