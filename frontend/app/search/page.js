'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import MovieCard from '@/components/MovieCard';
import { API_BASE_URL } from '@/config';
import Link from 'next/link';
import { Home, ArrowLeft, Loader2 } from 'lucide-react';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/api/search?q=${query}`);
                setResults(res.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        getResults();
    }, [query]);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 pt-24">
            <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition font-bold">
                    <ArrowLeft size={20} /> Back
                </Link>
                <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">CineVault</div>
                <Link href="/"><Home size={24} className="text-gray-400 hover:text-white" /></Link>
            </nav>

            <div className="max-w-[1400px] mx-auto">
                <h1 className="text-2xl font-bold mb-8 text-gray-400 tracking-tight">
                    Search Results for <span className="text-white italic">"{query}"</span>
                </h1>
                
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-500" size={40} /></div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {results.map((item) => (
                            <MovieCard key={item.id} movie={{
                                ...item,
                                tmdbId: item.id,
                                title: item.title || item.name,
                                type: item.media_type
                            }} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">No results found.</div>
                )}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return <Suspense><SearchResults /></Suspense>;
}