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
    const [expandedReviews, setExpandedReviews] = useState({}); // Tracking expanded state
    
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

    const toggleReview = (index) => {
        setExpandedReviews(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
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
            
            // Update local state immediately so user sees their review without refresh
            setMovie(prev => ({
                ...prev,
                userReviews: res.data // Use returned reviews list from backend
            }));

            setShowReviewForm(false);
            setReviewContent('');
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

    const getWatchLink = () => {
        if (!movie) return null;
        const homepage = movie.homepage || '';
        if (homepage.includes('netflix.com')) return { url: homepage, label: 'Watch on Netflix', color: 'bg-[#E50914] text-white hover:bg-red-700' };
        if (homepage.includes('primevideo.com')) return { url: homepage, label: 'Watch on Prime', color: 'bg-[#00A8E1] text-white hover:bg-blue-600' };
        if (movie.providers?.IN?.link) return { url: movie.providers.IN.link, label: 'Watch Options', color: 'bg-white text-black' };
        return { url: `https://www.google.com/search?q=watch+${encodeURIComponent(movie.title)}+online`, label: 'Find Where to Watch', color: 'bg-white/10' };
    };

    const watchAction = getWatchLink();
    const allReviews = [...(movie?.userReviews || []), ...(movie?.reviews || [])];

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold text-xl animate-pulse tracking-widest">CINEVAULT</div>;
    if (!movie) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold text-xl">Movie not found</div>;

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
            {/* BACKDROP HEADER */}
            <div className="relative w-full h-[70vh] md:h-[85vh]">
                <div className="absolute inset-0">
                    <img src={movie.backdrop_path || movie.poster_path} className="w-full h-full object-cover opacity-60" alt={movie.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                </div>
                <Link href="/" className="absolute top-6 left-6 z-50 bg-white/10 p-3 rounded-full hover:bg-white/20 backdrop-blur-md transition">
                    <ChevronLeft size={24} />
                </Link>
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-col md:flex-row gap-10 items-end">
                    <img src={movie.poster_path} className="hidden md:block w-64 rounded-xl shadow-2xl border border-white/10" alt={movie.title} />
                    <div className="max-w-4xl space-y-6 mb-6 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-300">
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
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-2xl">
                                {movie.title || movie.name}
                            </h1>
                            {movie.tagline && <p className="text-xl text-cyan-400/80 italic mt-2 font-medium">"{movie.tagline}"</p>}
                        </div>
                        <p className="text-lg text-gray-300 leading-relaxed max-w-2xl line-clamp-4 md:line-clamp-none">
                            {movie.overview}
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                            {watchAction ? (
                                <a href={watchAction.url} target="_blank" rel="noopener noreferrer">
                                    <button className={`${watchAction.color} px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 transition shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                                        <PlayCircle size={24} fill="currentColor" /> {watchAction.label}
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
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                            {movie.cast?.map((actor) => (
                                <div key={actor.id} className="min-w-[100px] md:min-w-[120px] text-center space-y-2 group">
                                    <div className="relative overflow-hidden rounded-xl">
                                        <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/placeholder_user.png'} className="w-full h-32 md:h-40 object-cover border border-white/5 bg-white/5 transition group-hover:scale-110" alt={actor.name} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-200 line-clamp-1">{actor.name}</p>
                                    <p className="text-xs text-gray-500 line-clamp-1">{actor.character}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    {movie.screenshots?.length > 0 && (
                        <section>
                            <h3 className="text-2xl font-bold flex items-center gap-2 mb-6"><ImageIcon className="text-purple-400" /> Photos</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {movie.screenshots.slice(0, 6).map((src, i) => (
                                    <img key={i} src={src} className="w-full h-32 md:h-48 object-cover rounded-xl border border-white/5 hover:opacity-80 transition duration-300" alt="Scene" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* REVIEWS SECTION */}
                    <section className="bg-white/5 p-6 rounded-3xl border border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <MessageSquare className="text-green-400" /> Reviews <span className="text-gray-500 text-lg">({allReviews.length})</span>
                            </h3>
                            <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-sm font-bold bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full transition flex items-center gap-2 border border-white/5">
                                <Plus size={16} /> Write Review
                            </button>
                        </div>
                        
                        {showReviewForm && (
                            <form onSubmit={handleReviewSubmit} className="bg-black/40 p-6 rounded-2xl mb-8 border border-white/10 animate-in fade-in slide-in-from-top-2">
                                <textarea className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500 outline-none min-h-[100px] text-sm" placeholder="What did you think of the movie?" value={reviewContent} onChange={e => setReviewContent(e.target.value)} required />
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">Your Rating:</span>
                                        <input type="number" min="1" max="10" value={reviewRating} onChange={e => setReviewRating(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg w-12 px-2 py-1 text-center text-sm"/>
                                        <Star size={14} className="text-yellow-400" fill="currentColor" />
                                    </div>
                                    <button disabled={submitting} className="bg-cyan-500 text-black font-bold px-6 py-2 rounded-full hover:bg-cyan-400 transition text-sm">
                                        {submitting ? 'Posting...' : 'Post Review'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {allReviews.length > 0 ? (
                                allReviews.map((review, i) => {
                                    const isLong = review.content.length > 300;
                                    const isExpanded = expandedReviews[i];
                                    return (
                                        <div key={i} className="bg-black/30 p-5 rounded-2xl border border-white/5 transition hover:border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                                                        {(review.author || "A").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="block font-bold text-gray-200 text-sm">{review.author || "Anonymous"}</span>
                                                        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">
                                                            {review.date ? new Date(review.date).toLocaleDateString() : review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recent'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg text-yellow-400 text-xs font-bold">
                                                    <Star size={12} fill="currentColor" /> {review.rating || review.author_details?.rating || '?'}
                                                </div>
                                            </div>
                                            
                                            <p className={`text-gray-300 text-sm leading-relaxed whitespace-pre-line ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                                                {review.content}
                                            </p>

                                            {isLong && (
                                                <button 
                                                    onClick={() => toggleReview(i)} 
                                                    className="mt-3 text-cyan-400 text-xs font-bold flex items-center gap-1 hover:text-cyan-300 transition"
                                                >
                                                    {isExpanded ? (
                                                        <><ChevronUp size={14} /> Show Less</>
                                                    ) : (
                                                        <><ChevronDown size={14} /> Read More</>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (<p className="text-gray-500 italic text-center py-8">No reviews yet. Share your thoughts!</p>)}
                        </div>
                    </section>
                </div>

                {/* Right Info Column */}
                <div className="space-y-8">
                    {movie.trailerKey && (
                        <div className="rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl group">
                            <iframe className="w-full aspect-video opacity-80 group-hover:opacity-100 transition" src={`https://www.youtube.com/embed/${movie.trailerKey}`} title="Trailer" allowFullScreen></iframe>
                        </div>
                    )}
                    
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                        <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest border-b border-white/5 pb-3">Movie Details</h4>
                        <div className="space-y-4 text-xs">
                            <div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-2"><Calendar size={14} /> Release Date</span> <span className="font-medium">{formatDate(movie.release_date)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-2"><Globe size={14} /> Language</span> <span className="font-medium uppercase">{movie.original_language || 'EN'}</span></div>
                            {movie.budget > 0 && (<div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-2"><DollarSign size={14} /> Budget</span> <span className="font-medium text-green-400">{formatMoney(movie.budget)}</span></div>)}
                             {movie.revenue > 0 && (<div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-2"><Activity size={14} /> Revenue</span> <span className="font-medium text-green-400">{formatMoney(movie.revenue)}</span></div>)}
                            <div className="flex justify-between items-center"><span className="text-gray-500">Status</span> <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${movie.status === 'Released' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{movie.status || 'Released'}</span></div>
                        </div>
                        <div className="pt-4 border-t border-white/5 space-y-3">
                            <div><span className="block text-gray-500 text-[10px] uppercase mb-1">Director</span> <span className="font-medium text-sm">{movie.directors?.join(', ') || 'Unknown'}</span></div>
                            <div><span className="block text-gray-500 text-[10px] uppercase mb-1">Writers</span> <span className="font-medium text-sm">{movie.writers?.join(', ') || 'Unknown'}</span></div>
                        </div>
                    </div>

                    {movie.recommendations?.length > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-4">Recommended</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {movie.recommendations.slice(0, 6).map(rec => (
                                    <Link key={rec.tmdbId} href={`/movie/${rec.tmdbId}?type=${rec.type || 'movie'}`} className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
                                        <img src={rec.poster_path} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                                            <p className="text-[10px] font-bold line-clamp-1">{rec.title}</p>
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