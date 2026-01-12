'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation'; // Added useSearchParams for type support
import axios from 'axios';
import Link from 'next/link';
import { PlayCircle, Star, Calendar, Clock, ChevronLeft, User } from 'lucide-react';
import { API_BASE_URL } from '@/config';
import WatchlistButton from '@/components/WatchlistButton'; // 👈 NEW IMPORT

export default function MoviePage() {
    const { id } = useParams();
    const searchParams = useSearchParams(); // To handle ?type=tv or ?type=movie
    const typeParam = searchParams.get('type') || 'movie'; 
    
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                // Pass the type (movie/tv/anime) to the backend to get correct details
                const res = await axios.get(`${API_BASE_URL}/api/movies/${id}?type=${typeParam}`);
                setMovie(res.data);
            } catch (err) {
                console.error("Failed to fetch movie", err);
            }
            setLoading(false);
        };
        if (id) fetchMovie();
    }, [id, typeParam]);

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold text-xl">Loading...</div>;
    if (!movie) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold text-xl">Movie not found</div>;

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            
            {/* BACKDROP HEADER */}
            <div className="relative w-full h-[70vh] md:h-[85vh]">
                <div className="absolute inset-0">
                    <img 
                        src={movie.backdrop_path || movie.poster_path} 
                        className="w-full h-full object-cover opacity-60" 
                        alt={movie.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                </div>

                {/* BACK BUTTON */}
                <Link href="/" className="absolute top-6 left-6 z-50 bg-white/10 p-3 rounded-full hover:bg-white/20 backdrop-blur-md transition">
                    <ChevronLeft size={24} />
                </Link>

                {/* CONTENT CONTAINER */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-col md:flex-row gap-10 items-end">
                    
                    {/* POSTER (Hidden on mobile, visible on desktop) */}
                    <img 
                        src={movie.poster_path} 
                        className="hidden md:block w-64 rounded-xl shadow-2xl border border-white/10"
                        alt={movie.title}
                    />

                    <div className="max-w-4xl space-y-6 mb-6">
                        {/* METADATA */}
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
                            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded text-xs border border-yellow-500/30 flex items-center gap-1">
                                <Star size={12} fill="currentColor" /> {movie.vote_average?.toFixed(1)}
                            </span>
                            <span className="flex items-center gap-1"><Calendar size={14} /> {movie.release_date?.split('-')[0]}</span>
                            {movie.runtime && <span className="flex items-center gap-1"><Clock size={14} /> {movie.runtime}m</span>}
                            {movie.genres?.map(g => (
                                <span key={g} className="bg-white/10 px-3 py-1 rounded-full text-xs">{g}</span>
                            ))}
                        </div>

                        {/* TITLE */}
                        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-2xl">
                            {movie.title || movie.name}
                        </h1>

                        {/* OVERVIEW */}
                        <p className="text-lg text-gray-300 leading-relaxed max-w-2xl line-clamp-4 md:line-clamp-none">
                            {movie.overview}
                        </p>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            {/* WATCH NOW BUTTON */}
                            <Link href={`/player/${id}?type=${movie.type || 'movie'}`}>
                                <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                                    <PlayCircle size={24} fill="black" /> Watch Now
                                </button>
                            </Link>

                            {/* 👇 NEW WATCHLIST BUTTON */}
                            <WatchlistButton movie={movie} />
                        </div>
                    </div>
                </div>
            </div>

            {/* CAST & TRAILER SECTION */}
            <div className="max-w-[1800px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* CAST LIST */}
                <div className="lg:col-span-2 space-y-8">
                    <h3 className="text-2xl font-bold flex items-center gap-2"><User className="text-cyan-400" /> Top Cast</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {movie.cast?.map((actor) => (
                            <div key={actor.id} className="min-w-[100px] md:min-w-[120px] text-center space-y-2">
                                <img 
                                    src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/placeholder_user.png'} 
                                    className="w-full h-32 md:h-40 object-cover rounded-xl border border-white/5 bg-white/5" 
                                    alt={actor.name} 
                                />
                                <p className="text-sm font-medium text-gray-200 line-clamp-1">{actor.name}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{actor.character}</p>
                            </div>
                        ))}
                    </div>

                    {/* RECOMMENDATIONS ROW */}
                    {movie.recommendations && movie.recommendations.length > 0 && (
                        <div className="mt-12 space-y-6">
                            <h3 className="text-2xl font-bold">You might also like</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {movie.recommendations.slice(0, 4).map(rec => (
                                    <Link key={rec.tmdbId} href={`/movie/${rec.tmdbId}?type=${rec.type || 'movie'}`} className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
                                        <img src={rec.poster_path} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                                            <p className="text-sm font-bold">{rec.title}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* TRAILER & INFO */}
                <div className="space-y-8">
                    {movie.trailerKey && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                            <iframe 
                                className="w-full aspect-video" 
                                src={`https://www.youtube.com/embed/${movie.trailerKey}`} 
                                title="Trailer" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                    
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                        <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Movie Info</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Director</span> <span>{movie.directors?.join(', ') || 'Unknown'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Writers</span> <span>{movie.writers?.join(', ') || 'Unknown'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Status</span> <span>{movie.status || 'Released'}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}