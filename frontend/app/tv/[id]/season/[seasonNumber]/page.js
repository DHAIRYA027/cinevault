'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Home, Calendar, Star, Clock, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';

export default function SeasonDetails() {
  const { id, seasonNumber } = useParams();
  const router = useRouter();
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeason = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tv/${id}/season/${seasonNumber}`);
        setSeason(response.data);
        setLoading(false);
      } catch (error) { setLoading(false); }
    };
    if (id && seasonNumber) fetchSeason();
  }, [id, seasonNumber]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center animate-pulse text-lg font-bold tracking-widest">LOADING EPISODES...</div>;
  if (!season) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Season not found</div>;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500/30 pb-20">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 p-4 flex justify-between items-center bg-black/90 backdrop-blur-md border-b border-white/5 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"><ArrowLeft size={24} /></button>
          <div className="hidden md:block text-xs font-bold text-gray-500 uppercase tracking-widest">Back to Show</div>
        </div>
        <Link href="/"><div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 cursor-pointer">CineVault</div></Link>
        <Link href="/"><button className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"><Home size={24} /></button></Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-28">
        
        {/* HERO HEADER */}
        <div className="flex flex-col md:flex-row gap-8 mb-16 animate-in slide-in-from-bottom-5 fade-in duration-700">
            <div className="w-full md:w-[200px] shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <img src={season.poster_path ? `https://image.tmdb.org/t/p/w500${season.poster_path}` : '/placeholder.jpg'} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-end pb-2">
                <h1 className="text-4xl md:text-6xl font-black mb-4">{season.name}</h1>
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400">
                    {season.air_date && (
                        <div className="flex items-center gap-2"><Calendar size={16} className="text-cyan-400" /><span>{season.air_date.split('-')[0]}</span></div>
                    )}
                    <div className="flex items-center gap-2"><Star size={16} className="text-yellow-400" /><span>{season.episodes?.length} Episodes</span></div>
                </div>
                <p className="text-gray-400 mt-4 text-lg max-w-2xl leading-relaxed">{season.overview || `Overview not available for ${season.name}.`}</p>
            </div>
        </div>

        {/* EPISODES LIST (Clickable Links) */}
        <div className="space-y-6">
            <h2 className="text-2xl font-black border-l-4 border-cyan-500 pl-4 mb-8">All Episodes</h2>
            
            {season.episodes?.map((episode) => (
                <Link key={episode.id} href={`/tv/${id}/season/${seasonNumber}/episode/${episode.episode_number}`}>
                    <div className="group flex flex-col md:flex-row gap-6 bg-[#111] hover:bg-[#161616] border border-white/5 p-4 rounded-xl transition-all duration-300 cursor-pointer mb-6">
                        {/* Thumbnail */}
                        <div className="w-full md:w-[240px] aspect-video rounded-lg overflow-hidden relative shrink-0">
                            {episode.still_path ? (
                                <img src={`https://image.tmdb.org/t/p/w500${episode.still_path}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">NO PREVIEW</div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                <PlayCircle size={40} className="text-white drop-shadow-lg" />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 py-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-200 group-hover:text-cyan-400 transition">
                                        <span className="text-gray-500 mr-3">#{episode.episode_number}</span>
                                        {episode.name}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {episode.air_date}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {episode.runtime ? `${episode.runtime}m` : 'N/A'}</span>
                                        <span className="flex items-center gap-1 text-yellow-500"><Star size={12} fill="currentColor" /> {episode.vote_average?.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 md:line-clamp-3 mt-3">{episode.overview}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </main>
  );
}