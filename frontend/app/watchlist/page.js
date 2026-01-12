'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Home, Film } from 'lucide-react';
import MovieCard from '@/components/MovieCard';

export default function Watchlist() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // Load movies from local storage
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('myList')) || [];
      setMovies(saved);
    }
  }, []);

  const removeFromList = (id) => {
    const updated = movies.filter(m => (m.tmdbId || m._id) !== id);
    setMovies(updated);
    localStorage.setItem('myList', JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20 selection:bg-cyan-500/30">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm transition-all">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/5 group">
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition" />
            </button>
          </Link>
          <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            MY LIBRARY
          </h1>
        </div>
        
        <Link href="/">
          <button className="p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 transition text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Home size={24} fill="currentColor" />
          </button>
        </Link>
      </nav>

      <div className="max-w-[1800px] mx-auto px-6 pt-32">
        
        {/* HEADER STATS */}
        <div className="mb-12 flex items-center gap-4 animate-in slide-in-from-left-10 fade-in duration-700">
            <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-3">
                <Film className="text-cyan-400" size={24} />
                <span className="text-xl font-bold">{movies.length} <span className="text-gray-400 text-sm font-normal">TITLES SAVED</span></span>
            </div>
        </div>

        {/* EMPTY STATE */}
        {movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-50 animate-in fade-in zoom-in duration-700">
            <Film size={64} className="mb-6 text-gray-600" />
            <h2 className="text-4xl font-black text-gray-500 mb-2">YOUR LIST IS EMPTY</h2>
            <p className="text-gray-400 mb-8">Go explore and add some movies!</p>
            <Link href="/discover">
              <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition">
                Browse Movies
              </button>
            </Link>
          </div>
        ) : (
          /* MOVIE GRID */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
            {movies.map((movie) => (
              <div key={movie.tmdbId || movie._id} className="relative group">
                {/* Remove Button (Appears on Hover) */}
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    removeFromList(movie.tmdbId || movie._id); 
                  }} 
                  className="absolute top-2 right-2 z-50 bg-red-600/90 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-500 shadow-xl backdrop-blur-md"
                  title="Remove from list"
                >
                  <Trash2 size={16} fill="white" className="text-white" />
                </button>
                
                {/* Re-using the MovieCard component */}
                <div className="transition duration-500 group-hover:scale-[1.02]">
                    <MovieCard movie={movie} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}