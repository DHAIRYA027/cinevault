'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import MovieCard from '@/components/MovieCard';
import { API_BASE_URL } from '@/config';
import Link from 'next/link';
import { Loader2, Film, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function WatchlistPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // Store errors to show user

    useEffect(() => {
        const fetchWatchlist = async () => {
            if (!isLoaded || !user) return;
            try {
                console.log("Fetching watchlist for:", user.id); // Log ID to console
                const res = await axios.get(`${API_BASE_URL}/api/watchlist/${user.id}`);
                console.log("Response:", res.data); // Log data to console
                setWatchlist(res.data);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError(err.message || "Failed to fetch data");
            }
            setLoading(false);
        };

        if (isLoaded && isSignedIn) {
            fetchWatchlist();
        } else if (isLoaded && !isSignedIn) {
            setLoading(false);
        }
    }, [isLoaded, isSignedIn, user]);

    if (!isLoaded) return <div className="min-h-screen bg-black" />;

    if (!isSignedIn) {
        return (
             <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
                <Film size={64} className="text-gray-600 mb-6" />
                <h1 className="text-3xl font-bold mb-4">Sign in to view your Watchlist</h1>
                <Link href="/"><button className="bg-white text-black px-8 py-3 rounded-full font-bold">Back to Home</button></Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 pt-24">
            <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center gap-4">
                <Link href="/" className="text-gray-400 hover:text-white transition"><ArrowLeft size={24} /></Link>
                <h1 className="text-xl font-bold">My Watchlist <span className="text-gray-500 text-sm ml-2">({watchlist.length})</span></h1>
            </nav>

            <div className="max-w-[1800px] mx-auto">
                {/* ERROR MESSAGE DISPLAY */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
                        <AlertTriangle />
                        <div>
                            <p className="font-bold">Error Loading Watchlist</p>
                            <p className="text-sm opacity-80">{error}</p>
                            <p className="text-xs mt-1">Check the Console (F12) for more details.</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-500" size={40} /></div>
                ) : watchlist.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {watchlist.map((item) => (
                            <div key={item.tmdbId} className="relative group animate-in fade-in duration-500">
                                <MovieCard movie={{
                                    ...item,
                                    id: item.tmdbId,
                                    tmdbId: item.tmdbId,
                                    vote_average: item.vote_average
                                }} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center opacity-0 animate-in fade-in slide-in-from-bottom-5 duration-700 forwards" style={{ opacity: 1 }}>
                        <div className="bg-white/5 p-8 rounded-full mb-6">
                            <Film size={48} className="text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Your list is empty</h2>
                        <p className="text-gray-400 mb-8">Movies and shows you save will appear here.</p>
                        <Link href="/discover">
                            <button className="bg-cyan-500 text-black px-8 py-3 rounded-full font-bold hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20">
                                Browse Movies
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}