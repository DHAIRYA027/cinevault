'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { PlayCircle, Info, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import { API_BASE_URL } from '@/config';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [heroMovies, setHeroMovies] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/movies?t=${new Date().getTime()}`);
        const allMovies = response.data;
        setMovies(shuffle(allMovies));
        
        const candidates = allMovies.filter(m => m.backdrop_path && m.vote_average > 7);
        setHeroMovies(shuffle(candidates).slice(0, 10));
        setLoading(false);
      } catch (error) { setLoading(false); }
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

  const getCategory = (criteria) => {
    if (!movies.length) return [];
    switch(criteria) {
      case 'trending': return movies.slice(0, 15);
      case 'popular_movies': return movies.filter(m => m.type === 'movie_popular').slice(0, 15);
      case 'netflix': return movies.filter(m => m.type === 'netflix').slice(0, 15);
      // Removed Hotstar case
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
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 cursor-pointer drop-shadow-lg">CineVault</div>
          <div className="flex items-center gap-6">
            <Link href="/watchlist" className="text-gray-300 hover:text-white font-bold text-xs transition">My List</Link>
            <Link href="/discover"><button className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/5 transition font-bold text-xs">Browse Library</button></Link>
          </div>
        </div>
      </nav>

      {/* Hero Reduced Height: 75vh */}
      {heroMovie && (
        <div className="relative w-full h-[75vh] flex items-center group">
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

      {/* Rows */}
      <div className="relative z-20 -mt-10 space-y-12 pl-6 md:pl-12">
        <Row title="Trending Now" id="trending" data={getCategory('trending')} />
        <Row title="Netflix Hits" id="netflix" data={getCategory('netflix')} />
        {/* Removed Hotstar Row */}
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