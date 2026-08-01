const API_KEY = "51e8f6fa27967e18cd00a4e246cb4b6b"
const IMG = "https://image.tmdb.org/t/p/w500"
const IMG_L = "https://image.tmdb.org/t/p/w780"

async function fetchTMDB(endpoint: string) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3${endpoint}&api_key=${API_KEY}`)
    const data = await res.json()
    return data.results || []
  } catch { return [] }
}

function mapTV(item: any): ContentItem {
  return {
    id: item.id, tmdbId: item.id, mediaType: "tv" as const,
    title: item.name || item.title || "Unknown",
    imageUrl: item.poster_path ? `${IMG}${item.poster_path}` : "https://via.placeholder.com/220x124",
    backdropUrl: item.backdrop_path ? `${IMG_L}${item.backdrop_path}` : undefined,
    match: item.vote_average ? Math.round(item.vote_average * 10) : 80,
    ageRating: "TV-MA", genres: [], overview: item.overview || "",
    isNew: item.first_air_date ? new Date(item.first_air_date) > new Date("2024-01-01") : false,
  }
}

function mapMovie(item: any): ContentItem {
  return {
    id: item.id, tmdbId: item.id, mediaType: "movie" as const,
    title: item.title || item.name || "Unknown",
    imageUrl: item.poster_path ? `${IMG}${item.poster_path}` : "https://via.placeholder.com/220x124",
    backdropUrl: item.backdrop_path ? `${IMG_L}${item.backdrop_path}` : undefined,
    match: item.vote_average ? Math.round(item.vote_average * 10) : 80,
    ageRating: "PG-13", genres: [], duration: "2h", overview: item.overview || "",
    isNew: item.release_date ? new Date(item.release_date) > new Date("2024-01-01") : false,
  }
}

let _cache: Record<string, ContentItem[]> = {}

// Maps each row key to its TMDB endpoint + content type, so "Explore All" can page in more results.
export const rowMeta: Record<string, { endpoint: string; type: "movie" | "tv" | "mixed" }> = {
  trendingNow:     { endpoint: "/trending/all/week?language=en-US", type: "mixed" },
  popularTV:       { endpoint: "/tv/popular?language=en-US", type: "tv" },
  popularMovies:   { endpoint: "/movie/popular?language=en-US", type: "movie" },
  topRatedTV:      { endpoint: "/tv/top_rated?language=en-US", type: "tv" },
  topRatedMovies:  { endpoint: "/movie/top_rated?language=en-US", type: "movie" },
  actionMovies:    { endpoint: "/discover/movie?with_genres=28&language=en-US&sort_by=popularity.desc", type: "movie" },
  horrorMovies:    { endpoint: "/discover/movie?with_genres=27&language=en-US&sort_by=popularity.desc", type: "movie" },
  scifiShows:      { endpoint: "/discover/tv?with_genres=10765&language=en-US&sort_by=popularity.desc", type: "tv" },
  comedyMovies:    { endpoint: "/discover/movie?with_genres=35&language=en-US&sort_by=popularity.desc", type: "movie" },
  crimeShows:      { endpoint: "/discover/tv?with_genres=80&language=en-US&sort_by=popularity.desc", type: "tv" },
  hindiContent:    { endpoint: "/discover/movie?with_original_language=hi&sort_by=popularity.desc", type: "movie" },
  koreanContent:   { endpoint: "/discover/tv?with_original_language=ko&sort_by=popularity.desc", type: "tv" },
  spanishContent:  { endpoint: "/discover/tv?with_original_language=es&sort_by=popularity.desc", type: "tv" },
  japaneseContent: { endpoint: "/discover/tv?with_original_language=ja&sort_by=popularity.desc", type: "tv" },
}

export async function fetchMoreForRow(rowKey: string, page: number): Promise<ContentItem[]> {
  const meta = rowMeta[rowKey]
  if (!meta) return []
  const raw = await fetchTMDB(`${meta.endpoint}&page=${page}`)
  if (meta.type === "mixed") {
    return raw.filter((i: any) => i.media_type !== "person").map((i: any) => (i.media_type === "movie" ? mapMovie(i) : mapTV(i)))
  }
  return raw.map(meta.type === "movie" ? mapMovie : mapTV)
}

export async function fetchAllRows() {
  if (Object.keys(_cache).length > 0) return _cache

  const [
    trending, popularTV, popularMovies, topRatedTV, topRatedMovies,
    action, horror, scifi, comedy, crime,
    hindi, korean, spanish, japanese
  ] = await Promise.all([
    fetchTMDB("/trending/all/week?language=en-US"),
    fetchTMDB("/tv/popular?language=en-US&page=1"),
    fetchTMDB("/movie/popular?language=en-US&page=1"),
    fetchTMDB("/tv/top_rated?language=en-US&page=1"),
    fetchTMDB("/movie/top_rated?language=en-US&page=1"),
    fetchTMDB("/discover/movie?with_genres=28&language=en-US&sort_by=popularity.desc"),
    fetchTMDB("/discover/movie?with_genres=27&language=en-US&sort_by=popularity.desc"),
    fetchTMDB("/discover/tv?with_genres=10765&language=en-US&sort_by=popularity.desc"),
    fetchTMDB("/discover/movie?with_genres=35&language=en-US&sort_by=popularity.desc"),
    fetchTMDB("/discover/tv?with_genres=80&language=en-US&sort_by=popularity.desc"),
    // Language specific
    fetchTMDB("/discover/movie?with_original_language=hi&sort_by=popularity.desc"),
    fetchTMDB("/discover/tv?with_original_language=ko&sort_by=popularity.desc"),
    fetchTMDB("/discover/tv?with_original_language=es&sort_by=popularity.desc"),
    fetchTMDB("/discover/tv?with_original_language=ja&sort_by=popularity.desc"),
  ])

  _cache = {
    trendingNow: trending.filter((i: any) => i.media_type !== "person").slice(0, 15).map((i: any) =>
      i.media_type === "movie" ? mapMovie(i) : mapTV(i)
    ),
    popularTV:     popularTV.slice(0, 15).map(mapTV),
    popularMovies: popularMovies.slice(0, 15).map(mapMovie),
    topRatedTV:    topRatedTV.slice(0, 15).map(mapTV),
    topRatedMovies:topRatedMovies.slice(0, 15).map(mapMovie),
    actionMovies:  action.slice(0, 15).map(mapMovie),
    horrorMovies:  horror.slice(0, 15).map(mapMovie),
    scifiShows:    scifi.slice(0, 15).map(mapTV),
    comedyMovies:  comedy.slice(0, 15).map(mapMovie),
    crimeShows:    crime.slice(0, 15).map(mapTV),
    hindiContent:  hindi.slice(0, 15).map(mapMovie),
    koreanContent: korean.slice(0, 15).map(mapTV),
    spanishContent:spanish.slice(0, 15).map(mapTV),
    japaneseContent:japanese.slice(0, 15).map(mapTV),
  }
  return _cache
}

export const heroContent = {
  title: "Stranger Things",
  description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
  imageUrl: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  tmdbId: 66732,
  mediaType: "tv",
}

// Legacy exports
export const trendingNow: ContentItem[] = []
export const popularOnNetflix: ContentItem[] = []
export const newReleases: ContentItem[] = []
export const topPicks: ContentItem[] = []
export const actionThriller: ContentItem[] = []
export const myList: ContentItem[] = []
export const continueWatching: ContentItem[] = []
