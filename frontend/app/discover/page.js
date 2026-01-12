'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Search, Filter, ArrowLeft, ChevronDown, SlidersHorizontal } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import { API_BASE_URL } from '@/config';

// 1. EXTENDED GENRE LIST (For the Dropdown)
const GENRES = [
    { id: 'all', name: 'All Categories' },
    { id: 'action', name: 'Action' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'anime', name: 'Anime' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'crime', name: 'Crime' },
    { id: 'documentary', name: 'Documentary' },
    { id: 'drama', name: 'Drama' },
    { id: 'family', name: 'Family' },
    { id: 'fantasy', name: 'Fantasy' },
    { id: 'history', name: 'History' },
    { id: 'horror', name: 'Horror' },
    { id: 'music', name: 'Music' },
    { id: 'mystery', name: 'Mystery' },
    { id: 'netflix', name: 'Netflix Originals' },
    { id: 'prime', name: 'Prime Video' },
    { id: 'romance', name: 'Romance' },
    { id: 'scifi', name: 'Sci-Fi' },
    { id: 'thriller', name: 'Thriller' },
    { id: 'war', name: 'War' },
    { id: 'western', name: 'Western' },
];

// 2. FORMATS (For the Top Buttons)
const FORMATS = [
    { id: 'all', name: 'All Formats' },
    { id: 'movie', name: 'Movies' },
    { id: 'tv', name: 'TV Shows' },
];

export default function DiscoverPage() {
    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter States
    const [search, setSearch] = useState('');
    const [selectedFormat, setSelectedFormat] = useState('all'); // Controlled by Buttons
    const [selectedGenre, setSelectedGenre] = useState('all');   // Controlled by Dropdown
    const [sortBy, setSortBy] = useState('popularity');
    
    // UI States
    const [showGenreMenu, setShowGenreMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/movies`);
                setMovies(res.data);
                setFilteredMovies(res.data);
            } catch (err) {
                console.error("Failed to fetch movies", err);
            }
            setLoading(false);
        };
        fetchMovies();
    }, []);

    // 3. FILTER LOGIC
    useEffect(() => {
        let result = [...movies];

        // Search Filter
        if (search) {
            result = result.filter(m => (m.title || m.name).toLowerCase().includes(search.toLowerCase()));
        }

        // Format Filter (Buttons)
        if (selectedFormat !== 'all') {
            result = result.filter(m => m.media_type === selectedFormat || m.type === selectedFormat);
        }

        // Genre Filter (Dropdown)
        if (selectedGenre !== 'all') {
            if (selectedGenre === 'netflix') {
                result = result.filter(m => m.type === 'netflix');
            } else if (selectedGenre === 'prime') {
                result = result.filter(m => m.type === 'prime');
            } else if (selectedGenre === 'anime') {
                result = result.filter(m => m.type === 'anime' || (m.genres && m.genres.includes(16))); // 16 is Animation ID
            } else {
                // Match by genre name string or ID if you have a map. 
                // Simple string match for now:
                result = result.filter(m => {
                    const g = selectedGenre.toLowerCase();
                    // Check custom type tag OR genre ID map (simplified for robustness)
                    return (m.type && m.type.includes(g)) || 
                           (m.genres && JSON.stringify(m.genres).includes(g)); 
                });
            }
        }

        // Sorting
        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date));
        } else if (sortBy === 'rating') {
            result.sort((a, b) => b.vote_average - a.vote_average);
        } else {
            // Default: Popularity (randomized shuffle usually, or existing order)
        }

        setFilteredMovies(result);
    }, [search, selectedFormat, selectedGenre, sortBy, movies]);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
            {/* Header */}
            <div className="fixed top-0 w-full z-40 bg-black/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
                <div className="max-w-[1900px] mx-auto px-6 py-4">
                    
                    {/* Top Row: Back, Search, Title */}
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"><ArrowLeft size={20} /></Link>
                            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Library</h1>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search your library..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-[#111] border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-cyan-500/50 transition text-white placeholder-gray-600 shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Bottom Row: FILTERS */}
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">
                        
                        {/* LEFT: Format Buttons (Pills) */}
                        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 no-scrollbar">
                            {FORMATS.map((format) => (
                                <button
                                    key={format.id}
                                    onClick={() => setSelectedFormat(format.id)}
                                    className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                                        selectedFormat === format.id
                                            ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                                            : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    {format.name}
                                </button>
                            ))}
                        </div>

                        {/* RIGHT: Dropdowns (Genre & Sort) */}
                        <div className="flex gap-3 w-full xl:w-auto">
                            
                            {/* GENRE DROPDOWN */}
                            <div className="relative flex-1 xl:flex-none">
                                <button 
                                    onClick={() => setShowGenreMenu(!showGenreMenu)}
                                    className="w-full xl:w-56 flex items-center justify-between px-4 py-2.5 bg-[#111] border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition"
                                >
                                    <span className="flex items-center gap-2 text-gray-300">
                                        <Filter size={14} className="text-cyan-400"/> 
                                        {GENRES.find(g => g.id === selectedGenre)?.name}
                                    </span>
                                    <ChevronDown size={16} className={`text-gray-500 transition ${showGenreMenu ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showGenreMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowGenreMenu(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-full xl:w-64 bg-[#161616] border border-white/10 rounded-xl shadow-2xl p-2 z-20 grid grid-cols-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {GENRES.map(genre => (
                                                <button
                                                    key={genre.id}
                                                    onClick={() => { setSelectedGenre(genre.id); setShowGenreMenu(false); }}
                                                    className={`text-left px-4 py-2.5 rounded-lg text-sm transition ${
                                                        selectedGenre === genre.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                                >
                                                    {genre.name}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* SORT DROPDOWN */}
                            <div className="relative flex-1 xl:flex-none">
                                <button 
                                    onClick={() => setShowSortMenu(!showSortMenu)}
                                    className="w-full xl:w-48 flex items-center justify-between px-4 py-2.5 bg-[#111] border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition"
                                >
                                    <span className="flex items-center gap-2 text-gray-300">
                                        <SlidersHorizontal size={14} /> 
                                        {sortBy === 'popularity' ? 'Most Popular' : sortBy === 'newest' ? 'Newest Added' : 'Top Rated'}
                                    </span>
                                    <ChevronDown size={16} className={`text-gray-500 transition ${showSortMenu ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showSortMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-full bg-[#161616] border border-white/10 rounded-xl shadow-2xl p-2 z-20 flex flex-col">
                                            {[
                                                { id: 'popularity', name: 'Most Popular' },
                                                { id: 'newest', name: 'Newest Added' },
                                                { id: 'rating', name: 'Top Rated' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => { setSortBy(opt.id); setShowSortMenu(false); }}
                                                    className={`text-left px-4 py-2.5 rounded-lg text-sm transition ${
                                                        sortBy === opt.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                                >
                                                    {opt.name}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="pt-52 px-6 max-w-[1900px] mx-auto">
                <div className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">
                    {filteredMovies.length} Titles Found
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredMovies.map((movie) => (
                            <div key={movie._id} className="animate-in fade-in duration-500">
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredMovies.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl">No movies found matching your filters.</p>
                        <button onClick={() => { setSearch(''); setSelectedFormat('all'); setSelectedGenre('all'); }} className="mt-4 text-cyan-400 hover:underline">Clear Filters</button>
                    </div>
                )}
            </div>
        </main>
    );
}