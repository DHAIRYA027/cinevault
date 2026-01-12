'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Home, MapPin, Calendar, Star, Facebook, Twitter, Instagram, Globe, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import { API_BASE_URL } from '@/config';

export default function PersonDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/person/${id}`);
        setPerson(response.data);
        setLoading(false);
      } catch (error) { setLoading(false); }
    };
    if (id) fetchPerson();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center animate-pulse text-lg font-bold tracking-widest">LOADING PROFILE...</div>;
  if (!person) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Person not found</div>;

  // Remove duplicates
  const uniqueKnownFor = person.known_for 
    ? [...new Map(person.known_for.map(item => [item.id, item])).values()]
    : [];

  // Helper for Social Links
  const SocialLink = ({ href, icon: Icon, label, color }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`p-3 rounded-full bg-white/5 border border-white/10 hover:scale-110 transition group ${color}`}
      title={label}
    >
      <Icon size={20} className="group-hover:text-white text-gray-400 transition" />
    </a>
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500/30 pb-20">
      
      {/* NAVBAR */}
      <div className="fixed top-6 left-6 z-50 flex gap-3">
        <button onClick={() => router.back()} className="bg-black/40 p-3 rounded-full backdrop-blur-xl transition hover:bg-white/20 border border-white/10 text-white"><ArrowLeft size={20} /></button>
        <Link href="/"><button className="bg-cyan-500 p-3 rounded-full transition hover:bg-cyan-400 hover:scale-110 border border-cyan-400/50 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"><Home size={20} fill="currentColor" /></button></Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32">
        
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row gap-10 items-start mb-20 animate-in slide-in-from-bottom-10 fade-in duration-700">
            {/* Profile Image */}
            <div className="w-full md:w-[300px] shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                <img 
                    src={person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : '/placeholder.jpg'} 
                    className="w-full h-full object-cover"
                    alt={person.name}
                />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-8">
                <div>
                    <h1 className="text-5xl md:text-7xl font-black leading-none drop-shadow-xl mb-4">{person.name}</h1>
                    
                    {/* SOCIAL LINKS ROW */}
                    <div className="flex items-center gap-3">
                        {person.external_ids?.imdb_id && (
                             <a href={`https://www.imdb.com/name/${person.external_ids.imdb_id}`} target="_blank" rel="noreferrer" className="bg-[#f5c518] text-black px-3 py-1 rounded font-black text-xs hover:scale-105 transition">IMDb</a>
                        )}
                        {person.external_ids?.instagram_id && <SocialLink href={`https://instagram.com/${person.external_ids.instagram_id}`} icon={Instagram} label="Instagram" color="hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500" />}
                        {person.external_ids?.twitter_id && <SocialLink href={`https://twitter.com/${person.external_ids.twitter_id}`} icon={Twitter} label="Twitter" color="hover:bg-blue-500" />}
                        {person.external_ids?.facebook_id && <SocialLink href={`https://facebook.com/${person.external_ids.facebook_id}`} icon={Facebook} label="Facebook" color="hover:bg-blue-600" />}
                        {person.homepage && <SocialLink href={person.homepage} icon={Globe} label="Website" color="hover:bg-cyan-500" />}
                    </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-400">
                    {person.birthday && (
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                            <Calendar size={16} className="text-cyan-400" />
                            <span>{person.birthday}</span>
                        </div>
                    )}
                    {person.place_of_birth && (
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                            <MapPin size={16} className="text-purple-400" />
                            <span>{person.place_of_birth}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                        <Star size={16} className="text-yellow-400" />
                        <span>{person.known_for_department}</span>
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <h3 className="text-xl font-bold border-l-4 border-cyan-500 pl-3">Biography</h3>
                    <p className="text-gray-300 leading-relaxed text-lg max-w-4xl whitespace-pre-line">
                        {person.biography || "No biography available."}
                    </p>
                </div>
            </div>
        </div>

        {/* KNOWN FOR GRID */}
        <div className="animate-in slide-in-from-bottom-10 fade-in duration-700 delay-200">
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">KNOWN FOR</span>
                <span className="text-sm font-normal text-gray-500 bg-white/10 px-3 py-1 rounded-full">{uniqueKnownFor.length || 0} Titles</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {uniqueKnownFor.map((movie) => (
                    <div key={movie.id} className="transition duration-500 hover:scale-[1.02] hover:z-10">
                        <MovieCard movie={{
                            ...movie,
                            tmdbId: movie.id, 
                            type: movie.media_type 
                        }} />
                    </div>
                ))}
            </div>
        </div>

      </div>
    </main>
  );
}