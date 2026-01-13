'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Star, Play, Plus, Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { API_BASE_URL } from '@/config';
import WatchlistButton from '@/components/WatchlistButton';

export default function MoviePage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type') || 'movie';
    const { user } = useUser();
    
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    // Review Form State
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(8);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/movies/${id}?type=${typeParam}`);
                setMovie(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchMovie();
    }, [id, typeParam]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Please sign in.");
        setSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/api/reviews/${movie.tmdbId}`, {
                author: user.fullName || user.username || "User",
                content: reviewContent,
                rating: reviewRating,
                type: movie.type
            });
            alert("Review submitted!");
            setReviewContent('');
        } catch (e) { alert("Failed to submit."); }
        setSubmitting(false);
    };

    if (loading) return <div className="min-h-screen bg-[#1F1F1F] text-white flex justify-center items-center">Loading...</div>;
    if (!movie) return <div className="min-h-screen bg-[#1F1F1F] text-white flex justify-center items-center">Movie not found</div>;

    const isTv = movie.type === 'tv';

    return (
        <div className="min-h-screen bg-[#1F1F1F] text-gray-100 font-sans pb-20">
            <div className="max-w-7xl mx-auto px-4 pt-6">
                
                {/* --- 1. HEADER SECTION (Title & Ratings) --- */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-normal text-white mb-2">{movie.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                            <span className="uppercase border border-gray-600 px-1 rounded text-xs font-bold">{isTv ? 'TV Series' : 'Movie'}</span>
                            <span>{movie.releaseYear}</span>
                            <span>{movie.runtime ? `${movie.runtime} min` : 'N/A'}</span>
                        </div>
                    </div>
                    
                    {/* IMDb Style Rating Box */}
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-gray-400 text-xs font-bold tracking-widest uppercase">IMDb RATING</span>
                            <div className="flex items-center gap-2">
                                <Star className="text-yellow-500 fill-yellow-500" size={28} />
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-white">{movie.vote_average?.toFixed(1)}<span className="text-gray-500 text-sm">/10</span></span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                             <span className="text-gray-400 text-xs font-bold tracking-widest uppercase">YOUR RATING</span>
                             <button className="flex items-center gap-1 text-blue-400 hover:bg-white/5 px-2 py-1 rounded transition">
                                <Star className="text-blue-400" size={20} /> <span className="font-bold">Rate</span>
                             </button>
                        </div>
                    </div>
                </div>

                {/* --- 2. HERO GRID (Poster | Trailer | Sidebar) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-2 mb-10">
                    
                    {/* A. Poster */}
                    <div className="relative group">
                        <img src={movie.poster_path} alt={movie.title} className="w-full h-auto object-cover rounded shadow-lg" />
                        <div className="absolute top-0 left-0 bg-black/60 text-white p-1 rounded-br">
                            <Plus className="w-6 h-6" />
                        </div>
                    </div>

                    {/* B. Trailer / Video Player */}
                    <div className="bg-black relative group flex items-center justify-center min-h-[400px]">
                        {movie.trailerKey ? (
                            <iframe 
                                className="w-full h-full absolute inset-0"
                                src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=0`}
                                title="Trailer"
                                allowFullScreen
                            />
                        ) : (
                            <div className="text-center">
                                <Play className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                                <span className="text-gray-500">No Trailer Available</span>
                            </div>
                        )}
                    </div>

                    {/* C. Quick Links Sidebar */}
                    <div className="hidden lg:flex flex-col gap-2">
                         <div className="bg-[#2C2C2C] p-4 rounded h-full flex flex-col gap-3">
                             {/* Watchlist Button */}
                             <WatchlistButton movie={movie} />
                             
                             <div className="mt-4 space-y-4">
                                <div>
                                    <span className="block text-gray-400 text-xs font-bold mb-1">Genres</span>
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genres.slice(0, 3).map(g => (
                                            <span key={g} className="border border-gray-500 rounded-full px-3 py-1 text-xs hover:bg-white/10 cursor-pointer">{g}</span>
                                        ))}
                                    </div>
                                </div>
                                {isTv && (
                                    <div>
                                        <span className="block text-gray-400 text-xs font-bold mb-1">Seasons</span>
                                        <span className="text-white font-bold">{movie.seasons?.length || 1} Seasons</span>
                                    </div>
                                )}
                             </div>
                         </div>
                    </div>
                </div>

                {/* --- 3. MAIN CONTENT BODY --- */}
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
                    
                    {/* LEFT COLUMN */}
                    <div className="space-y-10">
                        
                        {/* Overview */}
                        <section>
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                {movie.genres.map(g => (
                                    <span key={g} className="bg-[#2C2C2C] px-4 py-1 rounded-full text-sm border border-gray-700 whitespace-nowrap">{g}</span>
                                ))}
                            </div>
                            <p className="text-lg leading-relaxed text-white">{movie.overview}</p>
                            
                            <div className="mt-6 border-t border-gray-700 pt-4 space-y-3">
                                <div className="flex gap-4">
                                    <span className="font-bold text-white min-w-[80px]">{isTv ? 'Creators' : 'Director'}</span>
                                    <span className="text-blue-400">{movie.directors.length > 0 ? movie.directors.join(', ') : 'N/A'}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="font-bold text-white min-w-[80px]">Writers</span>
                                    <span className="text-blue-400">{movie.writers.length > 0 ? movie.writers.join(', ') : 'N/A'}</span>
                                </div>
                            </div>
                        </section>

                        {/* Top Cast */}
                        <section>
                            <h3 className="text-2xl font-bold text-yellow-500 mb-4 border-l-4 border-yellow-500 pl-3 flex items-center justify-between">
                                Top Cast <ChevronRight className="text-white" />
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {movie.cast.map(actor => (
                                    <div key={actor.id} className="flex items-center gap-3 bg-[#2C2C2C] p-2 rounded hover:bg-[#383838] transition">
                                        <img 
                                            src={actor.profile_path || '/placeholder_user.png'} 
                                            className="w-12 h-12 rounded-full object-cover" 
                                            alt={actor.name} 
                                        />
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-sm truncate text-white">{actor.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{actor.character}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* User Reviews */}
                        <section>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-yellow-500 border-l-4 border-yellow-500 pl-3">User Reviews</h3>
                                <span className="bg-white text-black px-3 py-1 rounded text-sm font-bold cursor-pointer hover:bg-gray-200" onClick={() => document.getElementById('reviewForm').scrollIntoView()}>+ Review</span>
                            </div>
                            
                            <div className="space-y-4">
                                {movie.reviews?.length > 0 ? movie.reviews.map((r, i) => (
                                    <div key={i} className="bg-[#2C2C2C] p-4 rounded border border-gray-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-blue-400">{r.author}</span>
                                            <span className="flex items-center gap-1 text-yellow-500 text-sm"><Star size={12} fill="currentColor"/> {r.author_details?.rating || '?'}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm line-clamp-3">{r.content}</p>
                                    </div>
                                )) : <p className="text-gray-500 italic">No reviews yet.</p>}
                            </div>

                            {/* Simple Review Form */}
                            <div id="reviewForm" className="mt-8 bg-[#252525] p-6 rounded border border-gray-700">
                                <h4 className="font-bold mb-4">Write a Review</h4>
                                <textarea 
                                    className="w-full bg-black border border-gray-600 rounded p-3 text-white mb-4 focus:border-yellow-500 outline-none" 
                                    rows="3"
                                    placeholder="Your thoughts..."
                                    value={reviewContent}
                                    onChange={e => setReviewContent(e.target.value)}
                                />
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Rating:</span>
                                        <input type="number" max="10" min="1" value={reviewRating} onChange={e => setReviewRating(e.target.value)} className="w-16 bg-black border border-gray-600 rounded p-1 text-center" />
                                    </div>
                                    <button onClick={handleReviewSubmit} disabled={submitting} className="bg-yellow-500 text-black px-6 py-2 rounded font-bold hover:bg-yellow-400">Post</button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <div className="space-y-8">
                        
                        {/* More Like This */}
                        <section>
                            <h3 className="font-bold text-lg mb-4 text-white">More like this</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {movie.recommendations.slice(0, 6).map(rec => (
                                    <Link href={`/movie/${rec.tmdbId}?type=${rec.type}`} key={rec.tmdbId} className="group">
                                        <div className="relative aspect-[2/3] mb-2">
                                            <img src={rec.poster_path} className="w-full h-full object-cover rounded" alt={rec.title} />
                                            <div className="absolute top-2 right-2 bg-black/60 px-1 rounded flex items-center gap-1">
                                                <Star size={10} className="text-yellow-500 fill-yellow-500"/>
                                                <span className="text-xs font-bold text-white">{rec.vote_average?.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-300 group-hover:text-blue-400 truncate">{rec.title}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Screenshots */}
                        {movie.screenshots?.length > 0 && (
                            <section>
                                <h3 className="font-bold text-lg mb-4 text-white flex justify-between items-center">
                                    Photos <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{movie.screenshots.length}</span>
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {movie.screenshots.slice(0, 4).map((src, i) => (
                                        <img key={i} src={src} className="w-full h-24 object-cover rounded hover:opacity-80 cursor-pointer" />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}