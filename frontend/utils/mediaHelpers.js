// frontend/utils/mediaHelpers.js

export const normalizeMediaData = (data, type) => {
  if (!data) return null;

  // Check if it's TV based on the 'type' arg OR data properties
  const isTv = type === 'tv' || data.media_type === 'tv' || data.first_air_date;

  return {
    id: data.id,
    type: isTv ? 'tv' : 'movie',
    title: isTv ? data.name : data.title,
    tagline: data.tagline,
    overview: data.overview,
    poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
    backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
    rating: data.vote_average ? data.vote_average.toFixed(1) : "NR",
    
    // Fixes "2022" vs "N/A" (TV uses first_air_date)
    releaseYear: (isTv ? data.first_air_date : data.release_date)?.substring(0, 4) || 'N/A',
    
    // Fixes "Runtime" (TV is episode_run_time array)
    runtime: isTv 
      ? (data.episode_run_time?.[0] ? `${data.episode_run_time[0]} min / ep` : 'N/A') 
      : (data.runtime ? `${data.runtime} min` : 'N/A'),
    
    // Fixes "Director" (Movies) vs "Creator" (TV)
    director: isTv 
      ? data.created_by?.map(c => c.name).join(", ") || "N/A" 
      : data.credits?.crew?.find(c => c.job === "Director")?.name || "N/A",
      
    budget: isTv ? null : (data.budget ? `$${(data.budget / 1000000).toFixed(1)}M` : "N/A"),
    
    // TV Specifics (Seasons)
    seasons: isTv ? data.seasons : null,
    
    // Finds the best trailer
    trailerKey: data.videos?.results?.find(
      (vid) => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
    )?.key
  };
};