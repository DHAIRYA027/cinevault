'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Home, Star, PlayCircle, Plus, Share2, MessageSquare, ChevronRight, Send, Layers } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';

export default function MovieDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCountry, setUserCountry] = useState('IN'); 
  const [providers, setProviders] = useState([]);
  
  // Review State
  const [newReview, setNewReview] = useState({ author: '', rating: 0, content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get('https://ipapi.co/json/').then(res => setUserCountry(res.data.country_code)).catch(() => setUserCountry('IN')); 
    const fetchMovie = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/movies/${id}`);
        setMovie(response.data);
        setLoading(false);
      } catch (error) { setLoading(false); }
    };
    if (id) fetchMovie();
  }, [id]);

  useEffect(() => {
    if (movie && movie.providers && userCountry) {
      const countryData = movie.providers[userCountry] || movie.providers['US']; 
      if (countryData) {
        const streamOptions = [...(countryData.flatrate || []), ...(countryData.free || [])];
        const unique = [...new Map(streamOptions.map(item => [item.provider_id, item])).values()];
        setProviders(unique);
      }
    }
  }, [movie, userCountry]);

  // Handlers
  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReview.rating || !newReview.content) return alert("Please add a rating and comment!");
    setSubmitting(true);
    try {
        const res = await axios.post(`${API_BASE_URL}/api/reviews/${movie.tmdbId}`, { ...newReview, type: movie.type });
        setMovie(prev => ({ ...prev, userReviews: res.data }));
        setNewReview({ author: '', rating: 0, content: '' });
        setSubmitting(false);
    } catch (error) { setSubmitting(false); alert("Failed to post review"); }
  };

  const openService = (providerName) => {
    if (!movie) return; 
    const query = encodeURIComponent(movie.title);
    const p = providerName.toLowerCase();
    
    if (p.includes('netflix')) window.open(`https://www.netflix.com/search?q=${query}`, '_blank');
    else if (p.includes('prime')) window.open(`https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${query}`, '_blank');
    else if (p.includes('disney') || p.includes('hotstar')) window.open(`https://www.hotstar.com/in/search?q=${query}`, '_blank');
    else if (p.includes('crunchyroll')) window.open(`https://www.crunchyroll.com/search?q=${query}`, '_blank');
    else if (p.includes('sonyliv')) window.open(`https://www.sonyliv.com/search?q=${query}`, '_blank');
    else if (p.includes('jiocinema')) window.open(`https://www.jiocinema.com/search?q=${query}`, '_blank');
    else window.open(`https://www.google.com/search?q=watch ${query} on ${providerName}`, '_blank');
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center animate-pulse text-lg font-bold tracking-widest">LOADING...</div>;
  if (!movie) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Item not found</div>;

  const allReviews = [...(movie.userReviews || []), ...(movie.reviews || [])];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-yellow-500/30 pb-20">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 p-4 flex justify-between items-center bg-black/90 backdrop-blur-md border-b border-white/5 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"><ArrowLeft size={24} /></button>
          <div className="hidden md:block text-xs font-bold text-gray-500 uppercase tracking-widest">Back to Browse</div>
        </div>
        <Link href="/"><div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-200 cursor-pointer">CineVault</div></Link>
        <Link href="/"><button className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"><Home size={24} /></button></Link>
      </nav>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-24">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div className="space-y-3">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">{movie.title}</h1>
                <div className="flex items-center gap-4 text-xs md:text-sm font-bold text-gray-400">
                    <span className="text-gray-300">{movie.release_date?.split('-')[0]}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span className="uppercase border border-gray-600 px-2 rounded text-[10px] tracking-wider">{movie.type}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span>{movie.runtime ? `${Math.floor(movie.runtime/60)}h ${movie.runtime%60}m` : 'N/A'}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="text-center hidden md:block">
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">CineVault RATING</div>
                    <div className="flex items-center gap-2 justify-end">
                        <Star size={32} className="text-yellow-400 fill-yellow-400" />
                        <div>
                            <span className="text-2xl font-black text-white">{movie.vote_average?.toFixed(1)}</span>
                            <span className="text-sm text-gray-500">/10</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* HERO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_340px] gap-6 mb-16 items-start">
            
            {/* COL 1: POSTER */}
            <div className="hidden lg:block relative rounded overflow-hidden border border-white/10 shadow-2xl h-fit">
                <img src={movie.poster_path} className="w-full object-cover" alt="Poster" />
            </div>

            {/* COL 2: TRAILER */}
            <div className="relative bg-black rounded overflow-hidden border border-white/10 shadow-2xl w-full aspect-video">
                 {movie.trailerKey ? (
                     <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=0&controls=1&showinfo=0&rel=0`} 
                        title="Trailer"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="w-full h-full object-cover"
                     />
                 ) : (
                     <>
                        <img src={movie.backdrop_path} className="w-full h-full object-cover opacity-60" alt="Backdrop" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-full border border-white/20">
                                <PlayCircle size={48} className="text-white" />
                            </div>
                        </div>
                     </>
                 )}
            </div>

            {/* COL 3: INFO SIDEBAR */}
            <div className="flex flex-col gap-4 h-full">
                <div className="bg-[#121212] p-5 rounded border border-white/5 flex flex-col gap-4">
                     <div className="flex flex-wrap gap-2 mb-2">
                        {movie.genres?.slice(0,3).map(g => (
                            <span key={g} className="text-[10px] font-bold border border-gray-700 text-gray-300 px-2 py-1 rounded-full uppercase">{movie.type === 'movie' ? 'Film' : 'Show'}</span>
                        ))}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-6 hover:line-clamp-none transition-all cursor-pointer">
                        {movie.overview}
                    </p>
                    <div className="border-t border-white/10 pt-4 space-y-3">
                        {movie.directors?.length > 0 && (
                            <div className="flex gap-2 text-sm border-b border-white/5 pb-2">
                                <span className="font-bold text-white w-16 shrink-0">Director</span>
                                <span className="text-blue-400">{movie.directors.join(', ')}</span>
                            </div>
                        )}
                        <div className="flex gap-2 text-sm">
                            <span className="font-bold text-white w-16 shrink-0">Stars</span>
                            <span className="text-blue-400 line-clamp-2">
                                {movie.cast.slice(0, 3).map(c => c.name).join(', ')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* STREAMING BUTTONS */}
                <div className="space-y-3 mt-auto">
                    {providers.length > 0 ? (
                        <>
                            <button 
                                onClick={() => openService(providers[0].provider_name)}
                                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-4 rounded flex items-center justify-center gap-3 transition text-sm uppercase tracking-wide shadow-lg"
                            >
                                <img src={`https://image.tmdb.org/t/p/original${providers[0].logo_path}`} className="w-6 h-6 rounded" alt="" />
                                Watch on {providers[0].provider_name}
                            </button>

                            {providers.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {providers.slice(1).map(p => (
                                        <button 
                                            key={p.provider_id}
                                            onClick={() => openService(p.provider_name)}
                                            className="bg-white/10 hover:bg-white/20 p-2 rounded flex items-center justify-center border border-white/5 transition group"
                                            title={`Watch on ${p.provider_name}`}
                                        >
                                            <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="w-8 h-8 rounded group-hover:scale-110 transition" alt={p.provider_name} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <button className="w-full bg-gray-800 text-gray-400 font-bold py-4 rounded flex items-center justify-center gap-2 cursor-not-allowed">
                            <PlayCircle size={18} /> No Streaming Info
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* --- 3. SEASONS SECTION (RE-ADDED) --- */}
        {movie.seasons?.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-yellow-500 uppercase tracking-tight border-l-4 border-yellow-500 pl-4">
                <Layers size={24} /> Seasons
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {movie.seasons.filter(s => s.season_number > 0 && s.poster_path).map((season) => (
                  <Link key={season.id} href={`/tv/${movie.tmdbId}/season/${season.season_number}`} className="min-w-[140px] group cursor-pointer">
                    <div className="rounded overflow-hidden mb-3 border border-white/10 shadow-lg relative">
                       <img src={`https://image.tmdb.org/t/p/w300${season.poster_path}`} className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition duration-500 opacity-90 group-hover:opacity-100" />
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                           <PlayCircle className="text-white" size={32} />
                       </div>
                    </div>
                    <h3 className="font-bold text-sm text-gray-200 group-hover:text-yellow-500 transition">{season.name}</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{season.episode_count} Eps</p>
                  </Link>
              ))}
            </div>
          </section>
        )}

        {/* --- 4. CAST SECTION --- */}
        <section className="mb-16">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-yellow-500 uppercase tracking-tight border-l-4 border-yellow-500 pl-4">Top Cast <ChevronRight /></h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movie.cast.map((actor) => (
                    <Link key={actor.id} href={`/person/${actor.id}`} className="group bg-[#111] rounded overflow-hidden border border-white/5 hover:border-white/20 transition">
                        <div className="aspect-[2/3] overflow-hidden">
                             {actor.profile_path ? (
                                <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                             ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">NO IMAGE</div>
                             )}
                        </div>
                        <div className="p-3">
                            <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition truncate">{actor.name}</h3>
                            <p className="text-xs text-gray-500 truncate">{actor.character}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

        {/* --- 5. REVIEWS & MORE LIKE THIS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 pb-20">
            <section>
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight border-l-4 border-yellow-500 pl-4 text-white">
                        User Reviews <span className="text-gray-500 text-lg font-normal">({allReviews.length})</span>
                    </h2>
                 </div>

                 {/* Write Review */}
                 <div className="bg-[#111] border border-white/10 p-6 rounded mb-8">
                    <h3 className="font-bold text-xs text-yellow-500 uppercase tracking-widest mb-4">Rate & Review</h3>
                    <form onSubmit={submitReview} className="space-y-4">
                        <div className="flex gap-2 mb-2">
                            {[1,2,3,4,5,6,7,8,9,10].map(s => (
                                <button key={s} type="button" onClick={() => setNewReview({...newReview, rating: s})} className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition border border-white/10 ${newReview.rating >= s ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black text-gray-600 hover:bg-white/10'}`}>{s}</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
                             <input type="text" placeholder="Your Name" className="bg-black border border-white/10 rounded px-4 py-3 text-sm focus:border-yellow-500 outline-none text-white" value={newReview.author} onChange={e => setNewReview({...newReview, author: e.target.value})} />
                             <input type="text" placeholder="Write your review here..." className="bg-black border border-white/10 rounded px-4 py-3 text-sm focus:border-yellow-500 outline-none text-white w-full" value={newReview.content} onChange={e => setNewReview({...newReview, content: e.target.value})} />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={submitting} className="bg-white text-black font-bold px-8 py-2 rounded text-sm hover:bg-gray-200 transition uppercase tracking-wider">{submitting ? 'Posting...' : 'Post Review'}</button>
                        </div>
                    </form>
                 </div>

                 <div className="space-y-4">
                    {allReviews.length > 0 ? allReviews.map((review, i) => (
                        <div key={i} className="bg-[#0f0f0f] border border-white/5 p-6 rounded relative hover:bg-[#151515] transition">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">{review.author ? review.author[0].toUpperCase() : 'A'}</div>
                                    <h4 className="font-bold text-blue-400 text-sm">{review.author || 'Anonymous'}</h4>
                                </div>
                                {review.rating && (
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                        <Star size={14} fill="currentColor" /> {review.rating}/10
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">&quot;{review.content}&quot;</p>
                        </div>
                    )) : (
                        <div className="text-gray-500 italic p-4">No reviews yet. Be the first to review!</div>
                    )}
                 </div>
            </section>

            <section>
                 <h2 className="text-xl font-black mb-6 border-l-4 border-white pl-4 uppercase tracking-tight text-white">More Like This</h2>
                 <div className="space-y-3">
                    {movie.recommendations?.slice(0, 6).map(rec => (
                        <Link key={rec.tmdbId} href={`/movie/${rec.tmdbId}`} className="flex gap-4 group p-2 hover:bg-white/5 rounded transition">
                            <div className="w-16 h-24 shrink-0 rounded overflow-hidden bg-gray-800">
                                <img src={rec.poster_path} className="w-full h-full object-cover group-hover:scale-110 transition" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h4 className="font-bold text-sm text-gray-200 group-hover:text-blue-400 transition line-clamp-2">{rec.title}</h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 font-bold">
                                    <Star size={10} className="text-yellow-500" fill="currentColor" /> {rec.vote_average?.toFixed(1)}
                                </div>
                            </div>
                        </Link>
                    ))}
                 </div>
            </section>
        </div>
      </div>
    </main>
  );
}