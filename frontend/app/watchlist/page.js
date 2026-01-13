'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { API_BASE_URL } from '@/config';
import MovieCard from '@/components/MovieCard';
import { Bookmark, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function WatchlistPage() {
    const { user, isLoaded } = useUser();
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && user) {
            axios.get(`${API_BASE_URL}/api/watchlist/${user.id}`)
                .then(res => { setWatchlist(res.data); setLoading(false); })
                .catch(err => { console.error(err); setLoading(false); });
        }
    }, [user, isLoaded]);

    if (!isLoaded || loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black animate-pulse">CINEVAULT</div>;

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
            <div className="max-w-[1800px] mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"><ChevronLeft/></Link>
                    <h1 className="text-3xl md:text-5xl font-black flex items-center gap-3">
                        <Bookmark className="text-cyan-400" size={32}/> My Watchlist
                    </h1>
                </div>

                {watchlist.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-gray-500 text-xl">Your watchlist is empty.</p>
                        <Link href="/discover" className="mt-4 inline-block text-cyan-400 font-bold hover:underline">Explore Movies</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8">
                        {watchlist.map((movie) => (
                            <div key={movie.tmdbId} className="animate-in fade-in duration-500">
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}