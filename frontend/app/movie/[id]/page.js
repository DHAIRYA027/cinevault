'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { PlayCircle, Star, Calendar, Clock, ChevronLeft, User, Image as ImageIcon, MessageSquare, Plus, Globe, DollarSign, Activity, ExternalLink } from 'lucide-react';
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
    
    // Review States
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(10);
    const [submitting, setSubmitting] = useState(false);

    const fetchMovie = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/movies/${id}?type=${typeParam}`);
            setMovie(res.data);
        } catch (err) {
            console.error("Failed to fetch movie", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (id) fetchMovie();
    }, [id, typeParam]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Please sign in to review!");
        setSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/api/reviews/${movie.tmdbId}`, {
                author: user.fullName || user.username || "Movie Fan",
                content: reviewContent,
                rating: reviewRating,
                type: typeParam
            });
            setShowReviewForm(false);
            setReviewContent('');
            fetchMovie(); 
        } catch (err) {
            alert("Failed to post review");
        }
        setSubmitting(false);
    };

    const formatMoney = (amount) => {
        if (!amount || amount === 0) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    const formatRuntime = (mins) => {
        if (!mins) return '';
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // 👇 SMART LINK LOGIC
    const getWatchLink = () => {
        if (!movie) return null;

        // 1. Check Homepage for direct streaming links (Netflix/Prime/Hotstar)
        const streamingDomains = ['netflix.com', 'primevideo.com', 'hotstar.com', 'jiocinema.com', 'apple.com', 'hulu.com', 'disneyplus.com'];
        if (movie.homepage && streamingDomains.some(d => movie.homepage.includes(d))) {
            return { url: movie.homepage, label: 'Stream Now' };
        }

        // 2. Check Providers (Official Sources)
        // Note: TMDB API 'link' usually points to a landing page, but it's the most accurate source.
        if (movie.providers?.IN?.link) return { url: movie.providers.IN.link, label: 'Watch Options' };
        if (movie.providers?.US?.link) return { url: movie.providers.US.link, label: 'Watch Options' };

        // 3. Fallback: Google Search
        const query = encodeURIComponent(`watch ${movie.title} online`);
        return { url: `https://www.google.com/search?q=${query}`, label: 'Find Where to Watch' };
    };

    const watchAction = getWatchLink();

    // 👇 MERGE REVIEWS (Local + Public)
    const allReviews = [
        ...(movie?.userReviews || []), // Your Local Users
        ...(movie?.reviews || [])      // TMDB Public Reviews
    ];

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold text-xl">Loading...</div>;
    if (!movie) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold text-xl">Movie not found</div>;

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
            
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

                <Link href="/" className="absolute top-6 left-6 z-50 bg-white/10 p-3 rounded-full hover:bg-white/20 backdrop-blur-md transition">
                    <ChevronLeft size={24} />
                </Link>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-col md:flex-row gap-10 items-end">
                    
                    {/* POSTER */}
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
                            <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><Calendar size={14} /> {movie.release_date?.split('-')[0]}</span>
                            {movie.runtime && <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><Clock size={14} /> {formatRuntime(movie.runtime)}</span>}
                            
                            {movie.genres?.slice(0,3).map(g => (
                                <span key={g} className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full text-xs">
                                    {typeof g === 'string' ? g : 'Reload Page'}
                                </span>
                            ))}
                        </div>

                        {/* TITLE */}
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-2xl">
                                {movie.title || movie.name}
                            </h1>
                            {movie.tagline && <p className="text-xl text-cyan-400/80 italic mt-2 font-medium">"{movie.tagline}"</p>}
                        </div>

                        {/* OVERVIEW */}
                        <p className="text-lg text-gray-300 leading-relaxed max-w-2xl line-clamp-4 md:line-clamp-none">
                            {movie.overview}
                        </p>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            
                            {/* SMART WATCH BUTTON */}
                            {watchAction ? (
                                <a href={watchAction.url} target="_blank" rel="noopener noreferrer">
                                    <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                        <PlayCircle size={24} fill="black" /> {watchAction.label}
                                    </button>
                                </a>
                            ) : (
                                <button disabled className="bg-white/20 text-gray-400 px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 cursor-not-allowed">
                                    <PlayCircle size={24} /> Unavailable
                                </button>
                            )}

                            <WatchlistButton movie={movie} />
                        </div>
                    </div>
                </div>
            </div>

            {/* REST OF PAGE */}
            <div className="max-w-[1800px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h3 className="text-2xl font-bold flex items-center gap-2 mb-6"><User className="text-cyan-400" /> Top Cast</h3>
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
                    </section>
                    
                    {movie.screenshots && movie.screenshots.length > 0 && (
                        <section>
                            <h3 className="text-2xl font-bold flex items-center gap-2 mb-6"><ImageIcon className="text-purple-400" /> Photos</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {movie.screenshots.slice(0, 6).map((src, i) => (
                                    <img key={i} src={src} className="w-full h-32 md:h-48 object-cover rounded-xl border border-white/5 hover:scale-105 transition duration-500" alt="Scene" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* REVIEWS SECTION (COMBINED) */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <MessageSquare className="text-green-400" /> Reviews <span className="text-gray-500 text-lg">({allReviews.length})</span>
                            </h3>
                            <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition flex items-center gap-2"><Plus size={16} /> Write Review</button>
                        </div>
                        
                        {showReviewForm && (
                            <form onSubmit={handleReviewSubmit} className="bg-white/5 p-6 rounded-2xl mb-8 border border-white/10 animate-in fade-in slide-in-from-top-2">
                                <textarea className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500 outline-none min-h-[100px]" placeholder="Write your thoughts..." value={reviewContent} onChange={e => setReviewContent(e.target.value)} required />
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2"><span className="text-sm text-gray-400">Rating:</span><input type="number" min="1" max="10" value={reviewRating} onChange={e => setReviewRating(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg w-16 px-2 py-1 text-center"/><Star size={16} className="text-yellow-400" fill="currentColor" /></div>
                                    <button disabled={submitting} className="bg-cyan-500 text-black font-bold px-6 py-2 rounded-full hover:bg-cyan-400 transition">{submitting ? 'Posting...' : 'Post Review'}</button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {allReviews.length > 0 ? (
                                allReviews.map((review, i) => (
                                    <div key={i} className="bg-white/5 p-6 rounded-xl border border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            {/* Author Name */}
                                            <span className="font-bold text-cyan-400">
                                                {review.author || review.author_details?.username || "Anonymous"}
                                            </span>
                                            
                                            {/* Date Logic (Handles both formats) */}
                                            <span className="text-xs text-gray-500">
                                                {review.date ? new Date(review.date).toLocaleDateString() : review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        
                                        {/* Rating Logic (Handles both formats) */}
                                        <div className="flex items-center gap-1 text-yellow-400 text-xs mb-3">
                                            <Star size={12} fill="currentColor" /> 
                                            {review.rating || review.author_details?.rating || '?'} / 10
                                        </div>
                                        
                                        {/* Content */}
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                            {review.content}
                                        </p>
                                    </div>
                                ))
                            ) : (<p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>)}
                        </div>
                    </section>
                </div>

                {/* Right Info Column */}
                <div className="space-y-8">
                    {movie.trailerKey && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                            <iframe className="w-full aspect-video" src={`https://www.youtube.com/embed/${movie.trailerKey}`} title="Trailer" allowFullScreen></iframe>
                        </div>
                    )}
                    
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-6">
                        <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest border-b border-white/5 pb-2">Movie Info</h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-2"><Calendar size={14} /> Release Date</span> <span className="font-medium text-right">{formatDate(movie.release_date)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-2"><Globe size={14} /> Language</span> <span className="font-medium uppercase">{movie.original_language || 'EN'}</span></div>
                            {movie.budget > 0 && (<div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-2"><DollarSign size={14} /> Budget</span> <span className="font-medium text-green-400">{formatMoney(movie.budget)}</span></div>)}
                             {movie.revenue > 0 && (<div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-2"><Activity size={14} /> Revenue</span> <span className="font-medium text-green-400">{formatMoney(movie.revenue)}</span></div>)}
                            <div className="flex justify-between items-center"><span className="text-gray-500">Status</span> <span className={`px-2 py-0.5 rounded text-xs font-bold ${movie.status === 'Released' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{movie.status || 'Released'}</span></div>
                        </div>
                    </div>

                    {movie.recommendations && movie.recommendations.length > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">You might also like</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {movie.recommendations.slice(0, 6).map(rec => (
                                    <Link key={rec.tmdbId} href={`/movie/${rec.tmdbId}?type=${rec.type || 'movie'}`} className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
                                        <img src={rec.poster_path} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                                            <p className="text-xs font-bold line-clamp-2">{rec.title}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}