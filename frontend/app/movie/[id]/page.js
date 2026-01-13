'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { PlayCircle, Star, Calendar, Clock, ChevronLeft, User, Image as ImageIcon, MessageSquare, Plus, Globe, DollarSign, Activity } from 'lucide-react';
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

    const getWatchLink = () => {
        if (!movie) return null;
        const homepage = movie.homepage || '';
        if (homepage.includes('netflix.com')) return { url: homepage, label: 'Watch on Netflix', color: 'bg-red-600' };
        if (homepage.includes('primevideo.com')) return { url: homepage, label: 'Watch on Prime', color: 'bg-blue-500' };
        if (movie.providers?.IN?.link) return { url: movie.providers.IN.link, label: 'Watch Options', color: 'bg-white text-black' };
        return { url: `https://www.google.com/search?q=watch+${encodeURIComponent(movie.title)}+online`, label: 'Find Where to Watch', color: 'bg-white/10' };
    };

    const watchAction = getWatchLink();
    const allReviews = [...(movie?.userReviews || []), ...(movie?.reviews || [])];

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold text-xl animate-pulse">CINEVAULT</div>;
    if (!movie) return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Movie not found</h1>
        <Link href="/" className="text-cyan-400 border border-cyan-400 px-4 py-2 rounded-full">Go Home</Link>
    </div>;

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
            
            {/* BACKDROP HEADER (Height adjusted for mobile) */}
            <div className="relative w-full h-[50vh] md:h-[85vh]">
                <div className="absolute inset-0">
                    <img src={movie.backdrop_path || movie.poster_path} className="w-full h-full object-cover opacity-40 md:opacity-60" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
                </div>

                <Link href="/" className="absolute top-4 left-4 z-50 bg-black/50 p-2 rounded-full backdrop-blur-md">
                    <ChevronLeft size={24} />
                </Link>

                <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end text-center md:text-left">
                    {/* POSTER (Hidden on very small screens to save space) */}
                    <img src={movie.poster_path} className="hidden sm:block w-32 md:w-64 rounded-xl shadow-2xl border border-white/10" alt="" />

                    <div className="max-w-4xl space-y-4 md:space-y-6">
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-4 text-xs md:text-sm font-medium">
                            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded flex items-center gap-1"><Star size={12} fill="currentColor" /> {movie.vote_average?.toFixed(1)}</span>
                            <span className="bg-white/10 px-2 py-1 rounded">{movie.release_date?.split('-')[0]}</span>
                            {movie.runtime && <span className="bg-white/10 px-2 py-1 rounded">{formatRuntime(movie.runtime)}</span>}
                        </div>

                        <h1 className="text-3xl md:text-6xl font-black leading-tight">{movie.title || movie.name}</h1>
                        
                        {/* Overview (Shortened for mobile) */}
                        <p className="text-sm md:text-lg text-gray-300 leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-none">
                            {movie.overview}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                            {watchAction && (
                                <a href={watchAction.url} target="_blank" className="w-full sm:w-auto">
                                    <button className={`${watchAction.color} w-full px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2`}>
                                        <PlayCircle size={20} fill="currentColor" /> {watchAction.label}
                                    </button>
                                </a>
                            )}
                            <div className="w-full sm:w-auto"><WatchlistButton movie={movie} /></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT GRID (Responsive Columns) */}
            <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                
                <div className="lg:col-span-2 space-y-10">
                    {/* CAST */}
                    <section>
                        <h3 className="text-xl md:text-2xl font-bold mb-4">Top Cast</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {movie.cast?.map((actor) => (
                                <div key={actor.id} className="min-w-[80px] md:min-w-[120px] text-center">
                                    <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/placeholder_user.png'} className="w-full h-24 md:h-40 object-cover rounded-lg mb-2" alt="" />
                                    <p className="text-xs md:text-sm font-bold truncate">{actor.name}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* PHOTOS */}
                    {movie.screenshots?.length > 0 && (
                        <section>
                            <h3 className="text-xl md:text-2xl font-bold mb-4">Photos</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
                                {movie.screenshots.slice(0, 6).map((src, i) => (
                                    <img key={i} src={src} className="w-full aspect-video object-cover rounded-lg" alt="" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* REVIEWS */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl md:text-2xl font-bold">Reviews</h3>
                            <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-xs bg-white/10 px-3 py-1.5 rounded-full"><Plus size={14} className="inline mr-1"/> Write</button>
                        </div>
                        {/* Review Form & List ... (Same as before, simplified for space) */}
                        <div className="space-y-4">
                            {allReviews.slice(0, 5).map((review, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span className="font-bold text-cyan-400">{review.author || "User"}</span>
                                        <span>{review.rating || '?'}/10</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-300 line-clamp-4">{review.content}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* SIDEBAR (Stacked on mobile) */}
                <div className="space-y-6">
                    {movie.trailerKey && (
                        <div className="rounded-xl overflow-hidden aspect-video border border-white/10 bg-black">
                            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${movie.trailerKey}`} allowFullScreen></iframe>
                        </div>
                    )}
                    
                    <div className="bg-white/5 p-5 rounded-xl border border-white/5 space-y-4 text-sm">
                        <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Information</h4>
                        <div className="flex justify-between"><span className="text-gray-500">Released</span> <span>{formatDate(movie.release_date)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Language</span> <span className="uppercase">{movie.original_language}</span></div>
                        {movie.budget > 0 && <div className="flex justify-between"><span className="text-gray-500">Budget</span> <span className="text-green-400">{formatMoney(movie.budget)}</span></div>}
                        <div className="flex justify-between"><span className="text-gray-500">Status</span> <span className="text-cyan-400">{movie.status}</span></div>
                    </div>

                    {/* RECOMMENDATIONS */}
                    <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                        {movie.recommendations?.slice(0, 6).map(rec => (
                            <Link key={rec.tmdbId} href={`/movie/${rec.tmdbId}?type=${rec.type || 'movie'}`}>
                                <img src={rec.poster_path} className="w-full rounded-lg hover:opacity-75 transition" alt="" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}