'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { PlayCircle, Star, Calendar, Clock, ChevronLeft, User, Image as ImageIcon, MessageSquare, Plus, Globe, DollarSign, Activity, ChevronDown, ChevronUp } from 'lucide-react';
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
    const [expandedReviews, setExpandedReviews] = useState({});
    
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
            setMovie(null);
        }
        setLoading(false);
    };

    useEffect(() => { if (id) fetchMovie(); }, [id, typeParam]);

    const toggleReview = (index) => {
        setExpandedReviews(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Please sign in to review!");
        setSubmitting(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/reviews/${movie.tmdbId}`, {
                author: user.fullName || user.username || "Movie Fan",
                content: reviewContent,
                rating: reviewRating,
                type: typeParam
            });
            setMovie(prev => ({ ...prev, userReviews: res.data }));
            setShowReviewForm(false);
            setReviewContent('');
        } catch (err) {
            alert("Failed to post review");
        }
        setSubmitting(false);
    };

    const getWatchLink = () => {
        if (!movie) return null;
        const title = encodeURIComponent(movie.title || movie.name);
        
        // 1. Direct Platform Detect (India Specific)
        if (movie.providers?.IN) {
            const sources = [...(movie.providers.IN.flatrate || []), ...(movie.providers.IN.free || [])];
            const has = (n) => sources.find(p => p.provider_name.toLowerCase().includes(n));

            if (has('netflix')) return { url: `https://www.netflix.com/search?q=${title}`, label: 'Watch on Netflix', color: 'bg-red-600' };
            if (has('amazon prime')) return { url: `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${title}`, label: 'Watch on Prime', color: 'bg-blue-500' };
            if (has('hotstar')) return { url: `https://www.hotstar.com/in/search?q=${title}`, label: 'Watch on Hotstar', color: 'bg-[#0c112b]' };
        }

        // 2. Aggressive Fallback to Google Search (Always opens in new tab)
        return { 
            url: `https://www.google.com/search?q=watch+${title}+online`, 
            label: 'Stream Now', 
            color: 'bg-white text-black hover:bg-cyan-400' 
        };
    };

    const watchAction = getWatchLink();
    const allReviews = [...(movie?.userReviews || []), ...(movie?.reviews || [])];

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black animate-pulse">CINEVAULT</div>;
    if (!movie) return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4"><h1>Movie not found</h1><Link href="/" className="text-cyan-400">Go Home</Link></div>;

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
            {/* HERO SECTION */}
            <div className="relative w-full min-h-[60vh] md:h-[85vh] flex flex-col justify-end">
                <div className="absolute inset-0">
                    <img src={movie.backdrop_path || movie.poster_path} className="w-full h-full object-cover opacity-40" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                </div>

                <Link href="/" className="absolute top-4 left-4 z-50 bg-black/50 p-2 rounded-full backdrop-blur-md">
                    <ChevronLeft size={24} />
                </Link>

                <div className="relative z-10 p-6 md:p-12 max-w-6xl space-y-6">
                    <h1 className="text-4xl md:text-7xl font-black">{movie.title || movie.name}</h1>
                    
                    {/* INFO BOX (Under Title) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs md:text-sm">
                        <div className="flex flex-col"><span className="text-gray-500 uppercase text-[10px]">Director</span><span className="font-bold truncate">{movie.directors?.join(', ') || 'N/A'}</span></div>
                        <div className="flex flex-col"><span className="text-gray-500 uppercase text-[10px]">Release</span><span className="font-bold">{movie.release_date?.split('-')[0]}</span></div>
                        <div className="flex flex-col"><span className="text-gray-500 uppercase text-[10px]">Budget</span><span className="font-bold text-green-400">{movie.budget > 0 ? `$${(movie.budget/1000000).toFixed(1)}M` : 'N/A'}</span></div>
                        <div className="flex flex-col"><span className="text-gray-500 uppercase text-[10px]">Rating</span><span className="font-bold text-yellow-400">★ {movie.vote_average?.toFixed(1)}</span></div>
                    </div>

                    <p className="text-gray-300 text-sm md:text-lg line-clamp-3 md:line-clamp-none">{movie.overview}</p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {watchAction && (
                            <a href={watchAction.url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                <button className={`${watchAction.color} w-full px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition transform hover:scale-105 shadow-xl`}>
                                    <PlayCircle size={20}/> {watchAction.label}
                                </button>
                            </a>
                        )}
                        <WatchlistButton movie={movie} />
                    </div>
                </div>
            </div>

            {/* REVIEWS (Moved to Bottom) */}
            <div className="max-w-[1800px] mx-auto px-6 mt-16 space-y-16">
                <section className="bg-white/5 p-6 md:p-10 rounded-3xl border border-white/10">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="text-green-400"/> Audience Reviews</h3>
                        <button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full text-sm transition">Write Review</button>
                    </div>

                    {showReviewForm && (
                        <form onSubmit={handleReviewSubmit} className="mb-8 p-6 bg-black/40 rounded-2xl border border-white/10">
                            <textarea className="w-full bg-transparent border-b border-white/10 p-2 outline-none mb-4" placeholder="Your thoughts..." value={reviewContent} onChange={e => setReviewContent(e.target.value)} required />
                            <button className="bg-cyan-500 text-black px-6 py-2 rounded-full font-bold">Post</button>
                        </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {allReviews.map((review, i) => {
                            const isExpanded = expandedReviews[i];
                            const isLong = review.content.length > 300;
                            return (
                                <div key={i} className="bg-black/40 p-6 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-cyan-400 font-bold">{review.author || "Anonymous"}</span>
                                        <span className="text-yellow-400 text-sm">★ {review.rating || '?'}/10</span>
                                    </div>
                                    <p className={`text-gray-400 text-sm leading-relaxed ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                                        {review.content}
                                    </p>
                                    {isLong && (
                                        <button onClick={() => toggleReview(i)} className="mt-3 text-cyan-400 text-xs font-bold flex items-center gap-1">
                                            {isExpanded ? <><ChevronUp size={14}/> Less</> : <><ChevronDown size={14}/> Read More</>}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </main>
    );
}