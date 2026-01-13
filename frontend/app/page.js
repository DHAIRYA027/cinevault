'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard'; // Ensure this path is correct

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [topRatedTV, setTopRatedTV] = useState([]);
  const [anime, setAnime] = useState([]);
  const [action, setAction] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);

  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  useEffect(() => {
    async function fetchHomeData() {
      try {
        // 1. Fetch Trending (for Hero & Row 1)
        const resTrending = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`);
        const dataTrending = await resTrending.json();
        setTrending(dataTrending.results.slice(0, 10));
        setHeroMovie(dataTrending.results[0]); // First item is Hero

        // 2. Fetch Top Rated TV
        const resTV = await fetch(`https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}&language=en-US&page=1`);
        const dataTV = await resTV.json();
        setTopRatedTV(dataTV.results.slice(0, 10));

        // 3. Fetch Anime (Animation Genre + Japanese)
        const resAnime = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&original_language=ja&sort_by=popularity.desc`);
        const dataAnime = await resAnime.json();
        setAnime(dataAnime.results.slice(0, 10));

        // 4. Fetch Action Movies
        const resAction = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=28&sort_by=popularity.desc`);
        const dataAction = await resAction.json();
        setAction(dataAction.results.slice(0, 10));

      } catch (error) {
        console.error("Error fetching homepage data:", error);
      }
    }

    fetchHomeData();
  }, []);

  return (
    <main className="min-h-screen bg-[#121212] text-white pb-20">
      
      {/* --- HERO SECTION --- */}
      {heroMovie && (
        <div className="relative w-full h-[80vh]">
          <div className="absolute inset-0">
            <img 
              src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`} 
              alt={heroMovie.title || heroMovie.name} 
              className="w-full h-full object-cover opacity-60" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 p-10 max-w-2xl z-20">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">
              {heroMovie.title || heroMovie.name}
            </h1>
            <p className="text-lg text-gray-200 line-clamp-3 mb-6 drop-shadow-md">
              {heroMovie.overview}
            </p>
            <div className="flex gap-4">
              <Link 
                href={`/movie/${heroMovie.id}?type=${heroMovie.media_type || 'movie'}`}
                className="bg-[#E50914] hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition"
              >
                More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* --- CATEGORY ROWS --- */}
      <div className="relative z-20 mt-[-50px] space-y-12 pl-6 md:pl-12">
        <Row title="Trending Now" items={trending} />
        <Row title="Top Rated TV Shows" items={topRatedTV} type="tv" />
        <Row title="Anime Collection" items={anime} type="tv" />
        <Row title="Action Movies" items={action} type="movie" />
      </div>
    </main>
  );
}

// Sub-component for clean rows
function Row({ title, items, type }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-white border-l-4 border-red-600 pl-3">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pr-6">
        {items.map((item) => (
          <div key={item.id} className="min-w-[160px] md:min-w-[200px]">
             {/* Pass specific type if known (e.g., 'tv' for Anime row) */}
             <MovieCard movie={item} type={type || item.media_type} />
          </div>
        ))}
      </div>
    </div>
  );
}