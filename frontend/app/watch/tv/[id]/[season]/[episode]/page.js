'use client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function WatchPage() {
  const { id, season, episode } = useParams();
  const router = useRouter();

  return (
    <main className="w-full h-screen bg-black relative flex flex-col">
      
      {/* Header / Back Button */}
      <div className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <button 
            onClick={() => router.back()} 
            className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition flex items-center gap-2 group"
        >
            <ArrowLeft size={24} /> 
            <span className="font-bold text-sm hidden group-hover:block pr-2">Go Back</span>
        </button>
      </div>

      {/* The Video Player */}
      <div className="w-full h-full">
         <iframe 
            src={`https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`} 
            className="w-full h-full" 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; encrypted-media; picture-in-picture"
         ></iframe>
      </div>

    </main>
  );
}