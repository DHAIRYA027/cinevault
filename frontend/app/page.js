'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlayCircle, Info, ChevronRight, ChevronLeft, Star, Search, Loader2, X } from 'lucide-react';
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());

  useEffect(() => {
    const fetchData = async () => {
      const cachedData = localStorage.getItem('home_movies_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setMovies(parsed);
        const candidates = parsed.filter(m => m.backdrop_path && m.vote_average > 7);
        setHeroMovies(shuffle(candidates).slice(0, 10));
        setLoading(false);
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/movies?t=${new Date().getTime()}`);
        const allMovies = response.data;
        setMovies(shuffle(allMovies));
        localStorage.setItem('home_movies_cache', JSON.stringify(allMovies));
        const freshCandidates = allMovies.filter(m => m.backdrop_path && m.vote_average > 7);
        if (!cachedData) setHeroMovies(shuffle(freshCandidates).slice(0, 10));
        setLoading(false);
      } catch (error) { 
        console.error("Silent refresh failed", error);
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const nextSlide = useCallback(() => setCurrentIndex((prev) => (prev + 1) % heroMovies.length), [heroMovies]);

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
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCategory = (criteria) => {
    if (!movies.length) return [];
    switch(criteria) {
      case 'trending': return movies.slice(0, 15);
      case 'netflix': return movies.filter(m => m.type === 'netflix').slice(0, 15);
      case 'anime': return movies.filter(m => m.type === 'anime').slice(0, 15);
      case 'tv_popular': return movies.filter(m => m.type === 'tv').slice(0, 15);
      default: return [];
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-black tracking-[0.5em] animate-pulse">CINEVAULT</div>
  );

  const heroMovie = heroMovies[currentIndex];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-xl border-b border-white/5 h-16 md:h-20">
        <div className="max-w-[1800px] mx-auto px-4 md:px-10 h-full flex items-center justify-between gap-4">
            
            <Link href="/" className="shrink-0">
                <div className="text-xl md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                    CineVault
                </div>
            </Link>
            
            {/* DESKTOP SEARCH */}
            <div className="relative flex-1 max-w-xl mx-auto hidden md:block">
                <form onSubmit={handleSearchSubmit} className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search movies, TV shows..." 
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-full py-2 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-white/10 transition"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-cyan-500" size={16} />}
                </form>

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                        {suggestions.map((item) => (
                            <Link 
                                key={item.id} 
                                href={`/movie/${item.id}?type=${item.media_type || 'movie'}`} 
                                onClick={() => setShowSuggestions(false)}
                                className="flex items-center gap-4 p-3 hover:bg-white/5 transition border-b border-white/5 last:border-0"
                            >
                                <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-10 h-14 object-cover rounded-lg shadow-lg" alt="" />
                                <div className="text-sm font-bold text-gray-200">{item.title || item.name}</div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* MOBILE ICONS */}
            <div className="flex items-center gap-3 md:gap-6">
                <button onClick={() => setIsMobileSearchOpen(true)} className="md:hidden p-2 text-gray-400 hover:text-white"><Search size={22}/></button>
                <Link href="/discover" className="hidden sm:block text-sm font-bold text-gray-400 hover:text-white transition">Library</Link>
                <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
                <SignedOut><SignInButton mode="modal"><button className="text-sm font-bold text-cyan-400">Sign In</button></SignInButton></SignedOut>
            </div>
        </div>

        {/* MOBILE SEARCH OVERLAY */}
        {isMobileSearchOpen && (
            <div className="fixed inset-0 z-[100] bg-black p-4 flex flex-col animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setIsMobileSearchOpen(false)}><X size={24}/></button>
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Search..." 
                        className="flex-1 bg-white/5 border border-white/10 rounded-full h-12 px-6 text-lg focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex-1 overflow-y-auto space-y-4">
                    {suggestions.map((item) => (
                        <Link 
                            key={item.id} 
                            href={`/movie/${item.id}?type=${item.media_type || 'movie'}`} 
                            onClick={() => setIsMobileSearchOpen(false)}
                            className="flex items-center gap-4 p-2 bg-white/5 rounded-xl"
                        >
                            <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-12 h-16 object-cover rounded-lg" alt="" />
                            <div className="font-bold">{item.title || item.name}</div>
                        </Link>
                    ))}
                </div>
            </div>
        )}
      </nav>

      {/* HERO & ROWS (Same as before but with spacing adjustments) */}
      {heroMovie && (
        <div className="relative w-full h-[70vh] md:h-[85vh] flex items-center mt-16 md:mt-0">
          <div className="absolute inset-0">
            <img src={heroMovie.backdrop_path} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          </div>
          <div className="relative z-10 max-w-4xl px-6 md:px-12 space-y-6">
            <h1 className="text-4xl md:text-8xl font-black leading-tight drop-shadow-2xl">{heroMovie.title}</h1>
            <p className="text-gray-300 text-sm md:text-xl max-w-xl line-clamp-3">{heroMovie.overview}</p>
            <div className="flex items-center gap-4 pt-4">
               <Link href={`/movie/${heroMovie.tmdbId}?type=movie`} className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm md:text-lg flex items-center gap-2 hover:scale-105 transition"><PlayCircle size={22} fill="black" /> Watch</Link>
               <Link href={`/movie/${heroMovie.tmdbId}?type=movie`} className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-3 rounded-full font-bold text-sm md:text-lg flex items-center gap-2 transition"><Info size={22} /> Details</Link>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-20 -mt-10 space-y-16 pl-4 md:pl-12">
        <Row title="Trending Now" id="trending" data={getCategory('trending')} />
        <Row title="Anime Collection" id="anime" data={getCategory('anime')} />
        <Row title="Netflix Originals" id="netflix" data={getCategory('netflix')} />
        <Row title="Popular TV Shows" id="tv_popular" data={getCategory('tv_popular')} />
      </div>
    </main>
  );
}

function Row({ title, id, data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-3xl font-bold hover:text-cyan-400 transition cursor-pointer">{title}</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 pr-12 no-scrollbar scroll-smooth">
        {data.map((movie) => (
            <div key={movie._id || movie.tmdbId} className="min-w-[150px] md:min-w-[220px] transition hover:scale-105 hover:z-10">
                <MovieCard movie={movie} />
            </div>
        ))}
      </div>
    </div>
  );
}