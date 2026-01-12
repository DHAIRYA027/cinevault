'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import { API_BASE_URL } from '@/config';

export default function CategoryView() {
  const params = useParams();
  const id = params?.id; // Safely access ID
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map IDs to readable titles
  const titles = {
    trending: 'Trending Now',
    netflix: 'Netflix Hits',
    hotstar: 'Disney+ Hotstar',
    prime: 'Prime Video',
    horror: 'Chilling Horror',
    scifi: 'Sci-Fi & Cyberpunk',
    action: 'High Octane Action',
    anime: 'Anime Collection',
    tv_popular: 'Popular TV Shows',
    movie_popular: 'Popular Movies',
    top_rated: 'Critically Acclaimed'
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch full library
        const response = await axios.get(`${API_BASE_URL}/api/movies`);
        const all = response.data;
        
        let filtered = [];
        // Filter logic matches Homepage logic
        switch(id) {
            case 'trending': filtered = all.filter(m => m.type === 'trending' || m.type === 'movie' || m.type === 'tv').slice(0, 100); break;
            case 'netflix': filtered = all.filter(m => m.type === 'netflix'); break;
            case 'hotstar': filtered = all.filter(m => m.type === 'hotstar'); break;
            case 'prime': filtered = all.filter(m => m.type === 'prime'); break;
            case 'horror': filtered = all.filter(m => m.type === 'horror'); break;
            case 'scifi': filtered = all.filter(m => m.type === 'scifi'); break;
            case 'action': filtered = all.filter(m => m.type === 'action'); break;
            case 'anime': filtered = all.filter(m => m.type === 'anime'); break;
            case 'tv_popular': filtered = all.filter(m => m.type === 'tv'); break;
            case 'movie_popular': filtered = all.filter(m => m.type === 'movie_popular'); break;
            case 'top_rated': filtered = all.filter(m => m.vote_average >= 8); break;
            default: filtered = all;
        }
        
        // Remove duplicates and items without posters
        const unique = [...new Map(filtered.map(item => [item.tmdbId, item])).values()]
                       .filter(m => m.poster_path);
        
        setMovies(unique);
        setLoading(false);
      } catch (error) { setLoading(false); }
    };
    fetchData();
  }, [id]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20 selection:bg-cyan-500/30">
      
      {/* HEADER */}
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center bg-black/90 backdrop-blur-md border-b border-white/5 shadow-2xl transition-all">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition group border border-white/5">
             <ArrowLeft size={24} className="group-hover:-translate-x-1 transition" />
          </button>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase tracking-tight">
            {titles[id] || 'Collection'}
          </h1>
        </div>
        <Link href="/">
            <button className="p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 transition text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Home size={24} fill="currentColor" />
            </button>
        </Link>
      </nav>

      <div className="max-w-[1800px] mx-auto px-6 pt-32">
        {loading ? (
             <div className="flex h-[50vh] items-center justify-center text-xl font-bold animate-pulse tracking-widest text-cyan-500">LOADING COLLECTION...</div>
        ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
               {movies.length > 0 ? movies.map((movie) => (
                 <div key={movie.tmdbId || movie._id} className="transition duration-500 hover:scale-[1.02] hover:z-10">
                   <MovieCard movie={movie} />
                 </div>
               )) : (
                 <div className="col-span-full text-center py-20 text-gray-500">No titles found in this collection.</div>
               )}
             </div>
        )}
      </div>
    </main>
  );
}