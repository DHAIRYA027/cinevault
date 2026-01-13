// Inside frontend/app/watchlist/page.js

// 1. Add this helper function at the top of the file
const removeDuplicates = (items) => {
  const seen = new Set();
  return items.filter(item => {
    const id = item.tmdbId || item.id; // Check both possible ID names
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

// 2. Update your data fetching block
useEffect(() => {
  // ... your existing fetch logic ...
  fetchWatchlist(user.id).then(data => {
      const uniqueData = removeDuplicates(data); // <--- FILTER HERE
      setWatchlist(uniqueData);
      setIsLoaded(true);
  });
}, [user]);