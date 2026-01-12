'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Home, Calendar, Star, Clock, PlayCircle, Tv } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';

export default function EpisodeDetails() {
  const { id, seasonNumber, episodeNumber } = useParams();
  const router = useRouter();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCountry, setUserCountry] = useState('IN'); 
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    // 1. Get User Country
    axios.get('https://ipapi.co/json/').then(res => setUserCountry(res.data.country_code)).catch(() => setUserCountry('IN')); 

    const fetchEpisode = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`);
        setEpisode(response.data);
        setLoading(false);
      } catch (error) { 
        console.error("Failed to fetch episode:", error);
        setLoading(false); 
      }
    };
    
    if (id && seasonNumber && episodeNumber) fetchEpisode();
  }, [id, seasonNumber, episodeNumber]);

  // 2. Process Providers when data loads
  useEffect(() => {
    if (episode && episode.providers && userCountry) {
      const countryData = episode.providers[userCountry] || episode.providers['US']; 
      if (countryData) {
        const streamOptions = [...(countryData.flatrate || []), ...(countryData.free || [])];
        const unique = [...new Map(streamOptions.map(item => [item.provider_id, item])).values()];
        setProviders(unique);
      }
    }
  }, [episode, userCountry]);

  // 3. Smart Open Function
  const openService = (providerName) => {
     if (!episode) return;
     // For TV shows, we search for the show name + episode code (e.g., "Arcane S02E01")
     const query = encodeURIComponent(`${episode.name} season ${seasonNumber} episode ${episodeNumber}`);
     const p = providerName.toLowerCase();

     // Platform Specific Searches
     if (p.includes('netflix')) window.open(`https://www.netflix.com/search?q=${query}`, '_blank');
     else if (p.includes('prime')) window.open(`https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${query}`, '_blank');
     else if (p.includes('disney') || p.includes('hotstar')) window.open(`https://www.hotstar.com/in/search?q=${query}`, '_blank');
     else if (p.includes('crunchyroll')) window.open(`https://www.crunchyroll.com/search?q=${query}`, '_blank');
     else if (p.includes('sonyliv')) window.open(`https://www.sonyliv.com/search?q=${query}`, '_blank');
     else if (p.includes('jiocinema')) window.open(`https://www.jiocinema.com/search?q=${query}`, '_blank');
     else window.open(`https://www.google.com/search?q=watch ${query} on ${providerName}`, '_blank');
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center animate-pulse text-lg font-bold tracking-widest">LOADING EPISODE...</div>;
  if (!episode || episode.error) return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4"><div className="text-xl font-bold text-red-500">Episode not found</div><button onClick={() => router.back()} className="bg-white/10 px-6 py-2 rounded text-sm font-bold hover:bg-white/20">Go Back</button></div>;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500/30 pb-20">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 p-4 flex justify-between items-center bg-black/90 backdrop-blur-md border-b border-white/5 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"><ArrowLeft size={24} /></button>
          <div className="hidden md:block text-xs font-bold text-gray-500 uppercase tracking-widest">Back to Season</div>
        </div>
        <Link href="/"><div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 cursor-pointer">CineVault</div></Link>
        <Link href="/"><button className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"><Home size={24} /></button></Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-32">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12 mb-16">
            
            {/* Left: Content */}
            <div>
                <div className="text-cyan-400 font-bold tracking-widest uppercase mb-2 text-sm">Season {seasonNumber} • Episode {episodeNumber}</div>
                <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">{episode.name}</h1>
                
                <div className="flex items-center gap-6 text-sm font-bold text-gray-400 mb-8">
                     <span className="flex items-center gap-2"><Calendar size={18} /> {episode.air_date || 'N/A'}</span>
                     <span className="flex items-center gap-2"><Clock size={18} /> {episode.runtime ? `${episode.runtime} min` : 'N/A'}</span>
                     <span className="flex items-center gap-2 text-yellow-500"><Star size={18} fill="currentColor" /> {episode.vote_average?.toFixed(1)}</span>
                </div>

                <div className="bg-[#111] p-6 rounded-xl border border-white/5 mb-8">
                    <p className="text-gray-300 text-lg leading-relaxed">{episode.overview || "No summary available."}</p>
                </div>

                {/* 👇 DYNAMIC WATCH BUTTONS */}
                <div className="space-y-4">
                    {providers.length > 0 ? (
                        <>
                            {/* Primary Button (Top Provider) */}
                            <button 
                                onClick={() => openService(providers[0].provider_name)}
                                className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-8 py-4 rounded-lg flex items-center gap-3 transition shadow-lg text-lg uppercase tracking-wide w-full md:w-auto justify-center hover:scale-105"
                            >
                                <img src={`https://image.tmdb.org/t/p/original${providers[0].logo_path}`} className="w-8 h-8 rounded" alt="" />
                                WATCH ON {providers[0].provider_name.toUpperCase()}
                            </button>

                            {/* Secondary Providers */}
                            {providers.length > 1 && (
                                <div className="flex flex-wrap gap-3">
                                    {providers.slice(1).map(p => (
                                        <button 
                                            key={p.provider_id}
                                            onClick={() => openService(p.provider_name)}
                                            className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 transition font-bold text-sm"
                                        >
                                            <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="w-5 h-5 rounded" alt="" />
                                            {p.provider_name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        // Fallback: Generic Search
                        <button 
                            onClick={() => window.open(`https://www.google.com/search?q=watch ${episode.name} episode`, '_blank')}
                            className="bg-gray-800 text-gray-400 font-bold px-8 py-4 rounded-lg flex items-center gap-3 transition cursor-pointer hover:bg-gray-700"
                        >
                            <Tv size={24} /> Find Where to Watch
                        </button>
                    )}
                </div>
            </div>

            {/* Right: Image */}
            <div className="hidden lg:block">
                <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                    <img src={episode.still_path ? `https://image.tmdb.org/t/p/original${episode.still_path}` : '/placeholder.jpg'} className="w-full object-cover" />
                </div>
            </div>
        </div>

        {/* Guest Stars (Kept from previous version) */}
        {episode.guest_stars?.length > 0 && (
             <section>
                <h2 className="text-2xl font-black border-l-4 border-cyan-500 pl-4 mb-8 uppercase tracking-wide">Guest Stars</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {episode.guest_stars.slice(0, 10).map(star => (
                        <Link key={star.id} href={`/person/${star.id}`} className="bg-[#111] rounded-lg overflow-hidden border border-white/5 hover:border-cyan-500/50 transition group">
                            <div className="aspect-square overflow-hidden">
                                {star.profile_path ? (
                                    <img src={`https://image.tmdb.org/t/p/w200${star.profile_path}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs">NO IMAGE</div>
                                )}
                            </div>
                            <div className="p-3">
                                <h4 className="font-bold text-sm text-gray-200 group-hover:text-cyan-400 truncate">{star.name}</h4>
                            </div>
                        </Link>
                    ))}
                </div>
             </section>
        )}
      </div>
    </main>
  );
}