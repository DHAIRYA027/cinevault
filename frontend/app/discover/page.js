'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Search, ArrowLeft, Home, X, Filter } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import { API_BASE_URL } from '@/config';

export default function Discover() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); 
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeType, setActiveType] = useState('All'); 
  const [sortBy, setSortBy] = useState('popularity'); 

  // 1. Fetch & DEDUPLICATE Library
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/movies`);
        const rawData = res.data;

        // 👇 FIX: Remove Duplicates based on TMDB ID
        const uniqueMovies = [
            ...new Map(rawData.map(item => [item.tmdbId, item])).values()
        ];

        setMovies(uniqueMovies);
        setFilteredMovies(uniqueMovies);
        setLoading(false);
      } catch (error) { console.error(error); setLoading(false); }
    };
    fetchLibrary();
  }, []);

  // 2. Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // 3. Filter Logic
  useEffect(() => {
    if (loading) return;

    let result = [...movies];
    const cleanQuery = debouncedQuery.toLowerCase().trim();

    // A. Search
    if (cleanQuery) {
      result = result.filter(m => {
          const title = (m.title || m.name || "").toLowerCase();
          return title.includes(cleanQuery); 
      });
    }

    // B. Type
    if (activeType !== 'All') {
      if (activeType === 'tv') result = result.filter(m => m.type === 'tv' || m.type === 'anime');
      else result = result.filter(m => m.type !== 'tv' && m.type !== 'anime');
    }

    // C. Genre
    if (activeGenre !== 'All') {
      if (activeGenre === 'Netflix') result = result.filter(m => m.type === 'netflix');
      else if (activeGenre === 'Anime') result = result.filter(m => m.type === 'anime');
      else if (activeGenre === 'Horror') result = result.filter(m => m.type === 'horror' || (m.genres && m.genres.includes(27)));
      else if (activeGenre === 'Sci-Fi') result = result.filter(m => m.type === 'scifi' || (m.genres && m.genres.includes(878)));
      else if (activeGenre === 'Action') result = result.filter(m => m.type === 'action' || (m.genres && m.genres.includes(28)));
    }

    // D. Sort
    if (sortBy === 'rating') result.sort((a, b) => b.vote_average - a.vote_average);
    else if (sortBy === 'newest') result.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    else result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    setFilteredMovies(result);
  }, [debouncedQuery, activeGenre, activeType, sortBy, movies, loading]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20 selection:bg-cyan-500/30">
      
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <Link href="/"><button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition group"><ArrowLeft size={24} className="group-hover:-translate-x-1 transition"/></button></Link>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 hidden md:block tracking-tighter">DISCOVER</h1>
        </div>
        
        <div className="flex-1 max-w-2xl mx-4 relative group">
            <Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition" size={20} />
            <input 
                type="text" 
                placeholder="Search for movies, TV shows, anime..." 
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-full py-3 pl-12 pr-12 outline-none focus:border-cyan-500 focus:bg-black transition text-sm font-medium text-white placeholder-gray-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <button onClick={() => setQuery('')} className="absolute right-4 top-3.5 text-gray-400 hover:text-white transition"><X size={18} /></button>
            )}
        </div>

        <Link href="/"><button className="p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition hover:scale-105"><Home size={24} /></button></Link>
      </nav>

      <div className="max-w-[1800px] mx-auto px-6 pt-32">
        
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-10 animate-in slide-in-from-top-5 fade-in duration-700">
            <div className="flex flex-wrap justify-center gap-2">
                {['All', 'Netflix', 'Anime', 'Horror', 'Sci-Fi', 'Action'].map((g) => (
                    <button 
                        key={g} 
                        onClick={() => setActiveGenre(g)}
                        className={`px-6 py-2.5 rounded-full text-xs font-bold border transition uppercase tracking-wider ${activeGenre === g ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-transparent text-gray-400 border-white/10 hover:border-white hover:text-white'}`}
                    >
                        {g}
                    </button>
                ))}
            </div>

            <div className="flex gap-4">
                <div className="relative">
                    <select value={activeType} onChange={(e) => setActiveType(e.target.value)} className="appearance-none bg-[#1a1a1a] border border-white/10 text-white text-xs font-bold py-3 pl-5 pr-10 rounded-xl outline-none focus:border-cyan-500 cursor-pointer hover:bg-white/5 transition">
                        <option value="All">ALL FORMATS</option>
                        <option value="movie">MOVIES</option>
                        <option value="tv">TV SHOWS</option>
                    </select>
                    <Filter size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none bg-[#1a1a1a] border border-white/10 text-white text-xs font-bold py-3 pl-5 pr-10 rounded-xl outline-none focus:border-cyan-500 cursor-pointer hover:bg-white/5 transition">
                        <option value="popularity">MOST POPULAR</option>
                        <option value="newest">NEWEST RELEASE</option>
                        <option value="rating">HIGHEST RATED</option>
                    </select>
                    <Filter size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
            </div>
        </div>

        {loading ? (
             <div className="flex h-[50vh] items-center justify-center text-xl font-bold animate-pulse tracking-widest text-cyan-500">SEARCHING DATABASE...</div>
        ) : (
             <>
                 <div className="text-gray-500 mb-6 font-mono text-xs uppercase tracking-widest border-b border-white/5 pb-2">
                    {filteredMovies.length} TITLES FOUND
                 </div>
                 
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
                   {/* Slice for performance */}
                   {filteredMovies.slice(0, 100).map((movie) => (
                     // 👇 KEY FIX: Use _id or fallback to tmdbId, but strictly unique due to filtering above
                     <div key={movie._id || movie.tmdbId} className="transition duration-500 hover:scale-[1.02] hover:z-10">
                       <MovieCard movie={movie} />
                     </div>
                   ))}
                 </div>

                 {filteredMovies.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-500 animate-in fade-in">
                        <Search size={48} className="mb-4 opacity-20" />
                        <h2 className="text-xl font-bold">No results found for {query}</h2>
                    </div>
                 )}
             </>
        )}
      </div>
    </main>
  );
}