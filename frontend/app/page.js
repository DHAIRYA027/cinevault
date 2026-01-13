'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [anime, setAnime] = useState([]);
  
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  useEffect(() => {
    // 1. Trending
    fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`)
      .then(res => res.json()).then(data => setTrending(data.results.slice(0, 10)));
      
    // 2. Popular Movies
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`)
      .then(res => res.json()).then(data => setPopularMovies(data.results.slice(0, 10)));
      
    // 3. TV Shows
    fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`)
      .then(res => res.json()).then(data => setPopularTV(data.results.slice(0, 10)));
      
    // 4. Anime (Genre 16 + Japanese)
    fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&original_language=ja&sort_by=popularity.desc`)
      .then(res => res.json()).then(data => setAnime(data.results.slice(0, 10)));
  }, []);

  return (
    <main className="min-h-screen bg-[#1F1F1F] text-white pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        <Section title="Trending Today" items={trending} />
        <Section title="Popular Movies" items={popularMovies} type="movie" />
        <Section title="TV Shows" items={popularTV} type="tv" />
        <Section title="Popular Anime" items={anime} type="tv" />
      </div>
    </main>
  );
}

// Reusable Row Component
function Section({ title, items, type }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="text-yellow-500 text-2xl font-bold mb-4 border-l-4 border-yellow-500 pl-3">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map(item => (
          <div key={item.id} className="min-w-[180px]">
             <MovieCard movie={item} type={type || item.media_type} />
          </div>
        ))}
      </div>
    </div>
  );
}