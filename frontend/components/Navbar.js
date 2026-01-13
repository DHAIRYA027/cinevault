import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-[#121212] text-white py-4 px-6 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="text-2xl font-black bg-yellow-500 text-black px-2 py-1 rounded">
          IMDb
        </Link>

        {/* MENU ITEMS */}
        <div className="flex items-center gap-6 font-bold text-sm md:text-base">
          <Link href="/" className="hover:text-yellow-500 transition">Home</Link>
          <Link href="/?category=movies" className="hover:text-yellow-500 transition">Movies</Link>
          <Link href="/?category=tv" className="hover:text-yellow-500 transition">TV Shows</Link>
          <Link href="/?category=anime" className="hover:text-yellow-500 transition">Anime</Link>
          
          {/* WATCHLIST BUTTON */}
          <Link href="/watchlist" className="flex items-center gap-2 hover:text-yellow-500 transition">
             <div className="bg-gray-800 p-1 rounded">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
             </div>
             Watchlist
          </Link>
        </div>
      </div>
    </nav>
  );
}