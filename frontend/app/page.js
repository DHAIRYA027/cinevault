'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlayCircle, Info, ChevronRight, ChevronLeft, Star, Search, Loader2 } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import MovieCard from '@/components/MovieCard';
import { API_BASE_URL } from '@/config';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [heroMovies, setHeroMovies] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search States
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());

  // 1. Fetch Home Data with LocalStorage Caching
  useEffect(() => {
    const fetchData = async () => {
      // ⚡️ INSTANT LOAD: Check LocalStorage first
      const cachedData = localStorage.getItem('home_movies_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setMovies(parsed);
        const candidates = parsed.filter(m => m.backdrop_path && m.vote_average > 7);
        setHeroMovies(shuffle(candidates).slice(0, 10));
        setLoading(false); // Stop spinner immediately
      }

      try {
        // Fetch Fresh Data in Background
        const response = await axios.get(`${API_BASE_URL}/api/movies?t=${new Date().getTime()}`);
        const allMovies = response.data;
        
        // Update State & Cache
        setMovies(shuffle(allMovies));
        localStorage.setItem('home_movies_cache', JSON.stringify(allMovies));
        
        // Update Hero if we didn't have cache, or just refresh it silently
        const candidates = allMovies.filter(m => m.backdrop_path && m.vote_average > 7);
        if (!cachedData) setHeroMovies(shuffle(candidates).slice(0, 10));
        
        setLoading(false);
      } catch (error) { 
        console.error("Background fetch failed", error);
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  // 2. Hero Auto-Slide
  const nextSlide = useCallback(() => setCurrentIndex((prev) => (prev + 1) % heroMovies.length), [heroMovies]);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? heroMovies.length - 1 : prev - 1));

  useEffect(() => {
    if (heroMovies.length === 0) return;
    const interval = setInterval(nextSlide, 10000); 
    return () => clearInterval(interval); 
  }, [heroMovies, nextSlide]);

  // 3. Live Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/api/search?q=${searchQuery}`);
          setSuggestions(res.data);
          setShowSuggestions(true);
        } catch (err) { console.error(err); }
        setIsSearching(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCategory = (criteria) => {
    if (!movies.length) return [];
    switch(criteria) {
      case 'trending': return movies.slice(0, 15);
      case 'popular_movies': return movies.filter(m => m.type === 'movie_popular').slice(0, 15);
      case 'netflix': return movies.filter(m => m.type === 'netflix').slice(0, 15);
      case 'prime': return movies.filter(m => m.type === 'prime').slice(0, 15);
      case 'horror': return movies.filter(m => m.type === 'horror').slice(0, 15);
      case 'scifi': return movies.filter(m => m.type === 'scifi').slice(0, 15);
      case 'tv_popular': return movies.filter(m => m.type === 'tv').slice(0, 15);
      case 'anime': return movies.filter(m => m.type === 'anime').slice(0, 15);
      default: return [];
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center animate-pulse text-lg font-bold tracking-widest">CINEVAULT</div>;
  const heroMovie = heroMovies[currentIndex];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500/30 pb-20">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5 shadow-2xl transition-all duration-300">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
            
            {/* 1. LEFT: LOGO */}
            <Link href="/" className="shrink-0 flex items-center">
                <div className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 cursor-pointer drop-shadow-lg">
                    CineVault
                </div>
            </Link>
            
            {/* 2. CENTER: SEARCH BAR */}
            <div className="relative flex-1 max-w-xl mx-auto hidden sm:block">
                <form onSubmit={handleSearchSubmit} className="relative group flex items-center">
                    <Search className="absolute left-3 text-gray-500 group-focus-within:text-cyan-400 transition" size={18} />
                    <input 
                    type="text" 
                    placeholder="Search movies, TV shows, anime..." 
                    className="w-full h-10 bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-white/10 transition text-white placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
                    />
                    {isSearching && <Loader2 className="absolute right-3 animate-spin text-cyan-500" size={16} />}
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    {suggestions.map((item) => (
                        <Link 
                        key={item.id} 
                        href={`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-4 p-3 hover:bg-white/5 transition border-b border-white/5 last:border-0 group"
                        >
                        <img src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : '/placeholder.jpg'} className="w-10 h-14 object-cover rounded shadow group-hover:scale-105 transition" alt="" />
                        <div>
                            <div className="font-bold text-sm text-gray-200 group-hover:text-cyan-400 transition">{item.title || item.name}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                            {item.media_type} • {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}
                            </div>
                        </div>
                        </Link>
                    ))}
                    </div>
                )}
            </div>

            {/* 3. RIGHT: ACTIONS */}
            <div className="flex items-center gap-6 shrink-0">
                <SignedIn>
                    <Link href="/watchlist" className="hidden md:flex items-center text-gray-300 hover:text-white font-bold text-sm transition h-10">
                        Watchlist
                    </Link>
                    <div className="flex items-center justify-center h-10 w-10"> 
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </SignedIn>
                
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="flex items-center text-gray-300 hover:text-white font-bold text-sm transition h-10">
                            Sign In
                        </button>
                    </SignInButton>
                </SignedOut>

                <Link href="/discover">
                    <button className="h-10 px-5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/5 transition font-bold text-xs flex items-center justify-center">
                        Browse Library
                    </button>
                </Link>
            </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      {heroMovie && (
        <div className="relative w-full h-[75vh] flex items-center group mt-16">
          <div key={heroMovie._id} className="absolute inset-0 animate-in fade-in duration-1000">
            <img src={heroMovie.backdrop_path} alt={heroMovie.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
          </div>
          <button onClick={prevSlide} className="absolute left-4 z-30 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition hover:bg-white/20 border border-white/10"><ChevronLeft size={24} /></button>
          <button onClick={nextSlide} className="absolute right-4 z-30 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition hover:bg-white/20 border border-white/10"><ChevronRight size={24} /></button>

          <div key={heroMovie._id + "_content"} className="relative z-10 max-w-4xl px-6 md:px-12 pt-10">
            <div className="flex items-center gap-3 mb-3 animate-in slide-in-from-left-10 fade-in duration-1000">
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">FEATURED</span>
              <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold"><Star size={12} fill="currentColor" /> {heroMovie.vote_average?.toFixed(1)}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none drop-shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-1000 delay-100">{heroMovie.title}</h1>
            <p className="text-gray-300 text-base md:text-lg max-w-xl line-clamp-3 mb-8 drop-shadow-md animate-in slide-in-from-bottom-5 fade-in duration-1000 delay-200">{heroMovie.overview}</p>

            <div className="flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-1000 delay-300">
               <Link href={`/movie/${heroMovie.tmdbId || heroMovie._id}`}><button className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition shadow-xl"><PlayCircle size={20} fill="black" /> Watch Now</button></Link>
               <Link href={`/movie/${heroMovie.tmdbId || heroMovie._id}`}><button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition hover:scale-105 shadow-xl"><Info size={20} /> Details</button></Link>
            </div>
          </div>
        </div>
      )}

      {/* ROWS */}
      <div className="relative z-20 -mt-10 space-y-12 pl-6 md:pl-12">
        <Row title="Trending Now" id="trending" data={getCategory('trending')} />
        <Row title="Netflix Hits" id="netflix" data={getCategory('netflix')} />
        <Row title="Prime Video Picks" id="prime" data={getCategory('prime')} />
        <Row title="Popular Movies" id="movie_popular" data={getCategory('popular_movies')} />
        <Row title="Popular TV Shows" id="tv_popular" data={getCategory('tv_popular')} />
        <Row title="Chilling Horror" id="horror" data={getCategory('horror')} />
        <Row title="Sci-Fi & Cyberpunk" id="scifi" data={getCategory('scifi')} />
        <Row title="Anime Collection" id="anime" data={getCategory('anime')} />
      </div>
    </main>
  );
}

function Row({ title, id, data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="space-y-3">
      <Link href={`/category/${id}`}>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 group cursor-pointer hover:text-cyan-400 transition w-fit">
          {title} <ChevronRight className="opacity-0 group-hover:opacity-100 transition" size={20} />
        </h2>
      </Link>
      <div className="flex overflow-x-auto gap-4 pb-4 pr-12 no-scrollbar scroll-smooth">
        {data.map((movie) => <div key={movie._id || movie.tmdbId} className="min-w-[140px] md:min-w-[180px] transition hover:scale-105 hover:z-10"><MovieCard movie={movie} /></div>)}
      </div>
    </div>
  );
}