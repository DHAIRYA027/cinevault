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

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());

  useEffect(() => {
    const fetchData = async () => {
      // ⚡️ STEP 1: Instant Load from Cache
      const cachedData = localStorage.getItem('home_movies_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setMovies(parsed);
        const candidates = parsed.filter(m => m.backdrop_path && m.vote_average > 7);
        setHeroMovies(shuffle(candidates).slice(0, 10));
        setLoading(false); // UI shows up immediately
      }

      try {
        // ⚡️ STEP 2: Silent Background Refresh
        // We add a timestamp to the URL to bypass any browser "memory" and get fresh data
        const response = await axios.get(`${API_BASE_URL}/api/movies?t=${new Date().getTime()}`);
        const allMovies = response.data;
        
        // ⚡️ STEP 3: Update Screen & Storage Silently
        setMovies(shuffle(allMovies));
        localStorage.setItem('home_movies_cache', JSON.stringify(allMovies));
        
        const freshCandidates = allMovies.filter(m => m.backdrop_path && m.vote_average > 7);
        // Only update hero if user hasn't started interacting or if no cache existed
        if (!cachedData) {
            setHeroMovies(shuffle(freshCandidates).slice(0, 10));
        }
        
        setLoading(false);
      } catch (error) { 
        console.error("Silent refresh failed", error);
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const nextSlide = useCallback(() => setCurrentIndex((prev) => (prev + 1) % heroMovies.length), [heroMovies]);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? heroMovies.length - 1 : prev - 1));

  useEffect(() => {
    if (heroMovies.length === 0) return;
    const interval = setInterval(nextSlide, 10000); 
    return () => clearInterval(interval); 
  }, [heroMovies, nextSlide]);

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

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl font-black tracking-[0.5em] animate-pulse">CINEVAULT</div>
    </div>
  );

  const heroMovie = heroMovies[currentIndex];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5 shadow-2xl h-16">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-4">
            <Link href="/" className="shrink-0 flex items-center">
                <div className="text-lg md:text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                    CineVault
                </div>
            </Link>
            
            <div className="relative flex-1 max-w-xl mx-auto hidden sm:block">
                <form onSubmit={handleSearchSubmit} className="relative group flex items-center">
                    <Search className="absolute left-3 text-gray-500 group-focus-within:text-cyan-400 transition" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search movies, TV shows..." 
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-white/10 transition text-white placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && <Loader2 className="absolute right-3 animate-spin text-cyan-500" size={16} />}
                </form>

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                        {suggestions.map((item) => (
                            <Link key={item.id} href={`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.id}`} className="flex items-center gap-4 p-3 hover:bg-white/5 transition border-b border-white/5 last:border-0 group">
                                <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-8 h-12 object-cover rounded shadow" alt="" />
                                <div className="text-sm font-bold text-gray-200">{item.title || item.name}</div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 md:gap-6 shrink-0 h-10">
                <SignedIn>
                    <Link href="/watchlist" className="hidden md:flex items-center text-gray-300 hover:text-white font-bold text-sm transition">Watchlist</Link>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="text-gray-300 hover:text-white font-bold text-sm">Sign In</button>
                    </SignInButton>
                </SignedOut>
                <Link href="/discover">
                    <button className="h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 transition font-bold text-[10px] md:text-xs flex items-center">
                        Library
                    </button>
                </Link>
            </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      {heroMovie && (
        <div className="relative w-full h-[60vh] md:h-[80vh] flex items-center group mt-16">
          <div className="absolute inset-0">
            <img src={heroMovie.backdrop_path} alt={heroMovie.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          </div>

          <div className="relative z-10 max-w-4xl px-6 md:px-12 space-y-4">
            <h1 className="text-3xl md:text-7xl font-black leading-none drop-shadow-2xl">{heroMovie.title}</h1>
            <p className="text-gray-300 text-sm md:text-lg max-w-xl line-clamp-3">{heroMovie.overview}</p>
            <div className="flex items-center gap-3 md:gap-4 pt-4">
               <Link href={`/movie/${heroMovie.tmdbId}`} className="bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition shadow-xl"><PlayCircle size={18} fill="black" /> Watch</Link>
               <Link href={`/movie/${heroMovie.tmdbId}`} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-sm flex items-center gap-2 transition hover:scale-105 shadow-xl"><Info size={18} /> Details</Link>
            </div>
          </div>
        </div>
      )}

      {/* ROWS */}
      <div className="relative z-20 -mt-10 space-y-12 pl-4 md:pl-12 overflow-hidden">
        <Row title="Trending Now" id="trending" data={getCategory('trending')} />
        <Row title="Netflix Hits" id="netflix" data={getCategory('netflix')} />
        <Row title="Anime Collection" id="anime" data={getCategory('anime')} />
        <Row title="Popular TV" id="tv_popular" data={getCategory('tv_popular')} />
      </div>
    </main>
  );
}

function Row({ title, id, data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="space-y-3">
      <Link href={`/category/${id}`}>
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 hover:text-cyan-400 transition w-fit">
          {title} <ChevronRight size={18} />
        </h2>
      </Link>
      <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 pr-12 no-scrollbar scroll-smooth">
        {data.map((movie) => (
            <div key={movie._id || movie.tmdbId} className="min-w-[130px] md:min-w-[180px] transition hover:scale-105 hover:z-10">
                <MovieCard movie={movie} />
            </div>
        ))}
      </div>
    </div>
  );
}