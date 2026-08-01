"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { SettingsProvider } from "@/components/netflix/settings-context"
import { CustomizationPanel } from "@/components/netflix/customization-panel"
import { Navbar } from "@/components/netflix/navbar"
import { HeroBanner } from "@/components/netflix/hero-banner"
import { ContentRow, type ContentItem } from "@/components/netflix/content-row"
import { Footer } from "@/components/netflix/footer"
import { VideoModal } from "@/components/netflix/video-modal"
import { fetchAllRows, fetchMoreForRow, heroContent } from "@/components/netflix/data"
import { motion, AnimatePresence } from "framer-motion"

// ── Intro Video ──────────────────────────────────────────────────
function IntroVideo({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const vid = videoRef.current
    if (vid) {
      vid.play().catch(() => onDone())
    }
    const t = setTimeout(onDone, 5000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center cursor-pointer"
      onClick={onDone}
    >
      <video
        ref={videoRef}
        src="https://res.cloudinary.com/dkvqppddq/video/upload/v1777918695/Netflix_New_Logo_Animation_2019_sdwnxm.mp4"
        muted
        playsInline
        onEnded={onDone}
        className="w-full h-full object-contain"
      />
      <p className="absolute bottom-8 text-gray-600 text-xs animate-pulse">Click anywhere to skip</p>
    </motion.div>
  )
}

// ── Main Content ─────────────────────────────────────────────────
function NetflixContent() {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ContentItem[]>([])
  const [activeTab, setActiveTab] = useState<"home" | "tvshows" | "movies" | "mylist" | "language">("home")
  const [myList, setMyList] = useState<ContentItem[]>([])
  const [history, setHistory] = useState<ContentItem[]>([])
  const [likedItems, setLikedItems] = useState<ContentItem[]>([])
  const [exploreView, setExploreView] = useState<{ key?: string; title: string; items: ContentItem[]; page: number } | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [rows, setRows] = useState<Record<string, ContentItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(false)
  const [introChecked, setIntroChecked] = useState(false)

  const API_KEY = "51e8f6fa27967e18cd00a4e246cb4b6b"

  // ── Intro check — client only ──
  useEffect(() => {
    const shown = sessionStorage.getItem("auraflix_intro_v2")
    if (!shown) setShowIntro(true)
    setIntroChecked(true)
  }, [])

  const handleIntroDone = useCallback(() => {
    setShowIntro(false)
    sessionStorage.setItem("auraflix_intro_v2", "1")
  }, [])

  // ── Fetch content ──
  useEffect(() => {
    fetchAllRows()
      .then(data => { setRows(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // ── My List / History / Liked from localStorage ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem("auraflix_mylist")
      if (saved) setMyList(JSON.parse(saved))
      const savedHistory = localStorage.getItem("auraflix_history")
      if (savedHistory) setHistory(JSON.parse(savedHistory))
      const savedLiked = localStorage.getItem("auraflix_liked")
      if (savedLiked) setLikedItems(JSON.parse(savedLiked))
    } catch {}
  }, [])

  const toggleMyList = useCallback((item: ContentItem) => {
    setMyList(prev => {
      const exists = prev.find(i => i.id === item.id)
      const next = exists ? prev.filter(i => i.id !== item.id) : [...prev, item]
      try { localStorage.setItem("auraflix_mylist", JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const isInMyList = useCallback((id: number) => myList.some(i => i.id === id), [myList])

  const addToHistory = useCallback((item: ContentItem) => {
    setHistory(prev => {
      const withoutItem = prev.filter(i => i.id !== item.id)
      const next = [item, ...withoutItem].slice(0, 30)
      try { localStorage.setItem("auraflix_history", JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const toggleLiked = useCallback((item: ContentItem) => {
    setLikedItems(prev => {
      const exists = prev.find(i => i.id === item.id)
      const next = exists ? prev.filter(i => i.id !== item.id) : [...prev, item]
      try { localStorage.setItem("auraflix_liked", JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const isLikedItem = useCallback((id: number) => likedItems.some(i => i.id === id), [likedItems])

  const handleExploreAll = useCallback((rowKey: string | undefined, title: string, items: ContentItem[]) => {
    setExploreView({ key: rowKey, title, items, page: 1 })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleCloseExplore = useCallback(() => setExploreView(null), [])

  const handleLoadMoreExplore = useCallback(async () => {
    if (!exploreView?.key || loadingMore) return
    setLoadingMore(true)
    try {
      const nextPage = exploreView.page + 1
      const more = await fetchMoreForRow(exploreView.key, nextPage)
      setExploreView(prev => {
        if (!prev) return prev
        const existingIds = new Set(prev.items.map(i => i.id))
        const merged = [...prev.items, ...more.filter(i => !existingIds.has(i.id))]
        return { ...prev, items: merged, page: nextPage }
      })
    } catch {}
    setLoadingMore(false)
  }, [exploreView, loadingMore])

  // ── Search ──
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&include_adult=false`
        )
        const data = await res.json()
        const filtered = (data.results || [])
          .filter((i: any) => (i.media_type === "tv" || i.media_type === "movie") && i.poster_path)
          .slice(0, 20)
          .map((i: any) => ({
            id: i.id, tmdbId: i.id, mediaType: i.media_type,
            title: i.title || i.name || "Unknown",
            imageUrl: `https://image.tmdb.org/t/p/w500${i.poster_path}`,
            backdropUrl: i.backdrop_path ? `https://image.tmdb.org/t/p/w780${i.backdrop_path}` : undefined,
            match: i.vote_average ? Math.round(i.vote_average * 10) : 80,
            overview: i.overview || "",
            ageRating: i.media_type === "movie" ? "PG-13" : "TV-MA",
          }))
        setSearchResults(filtered)
      } catch {}
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleOpenModal = useCallback((item: ContentItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedItem(null), 300)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab)
    setSearchQuery("")
    setSearchResults([])
    setExploreView(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // ── Helpers ──
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-32">
      <div className="w-12 h-12 border-2 border-gray-800 border-t-red-600 rounded-full animate-spin" />
    </div>
  )

  const renderGrid = (items: ContentItem[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {items.map(item => (
        <div key={item.id} className="cursor-pointer group" onClick={() => handleOpenModal(item)}>
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900">
            <img
              src={item.imageUrl} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x300/111/555?text=No+Image" }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <svg className="h-8 w-8 text-white fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${item.mediaType === "movie" ? "bg-yellow-500/80 text-black" : "bg-red-600/80 text-white"}`}>
                {item.mediaType === "movie" ? "Movie" : "TV"}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs md:text-sm text-gray-400 truncate group-hover:text-white transition-colors">{item.title}</p>
          {item.match && (
            <p className="text-xs font-semibold" style={{ color: item.match > 70 ? "#46D369" : "#FFC107" }}>
              {item.match}% Match
            </p>
          )}
        </div>
      ))}
    </div>
  )

  const heroItem: ContentItem = {
    id: heroContent.tmdbId,
    tmdbId: heroContent.tmdbId,
    mediaType: heroContent.mediaType as "tv" | "movie",
    title: heroContent.title,
    imageUrl: heroContent.imageUrl,
    backdropUrl: heroContent.imageUrl,
    overview: heroContent.description,
  }

  if (!introChecked) return null

  return (
    <>
      {/* ── INTRO ── */}
      <AnimatePresence>
        {showIntro && <IntroVideo onDone={handleIntroDone} />}
      </AnimatePresence>

      <main className="min-h-screen bg-black overflow-x-hidden">
        <CustomizationPanel />
        <VideoModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isInMyList={isInMyList}
          onToggleMyList={toggleMyList}
          onPlay={addToHistory}
          isLiked={isLikedItem}
          onToggleLike={toggleLiked}
        />

        {/* ── EXPLORE ALL OVERLAY ── */}
        <AnimatePresence>
          {exploreView && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[70] bg-black overflow-y-auto"
            >
              <div className="pt-20 md:pt-24 px-4 md:px-8 lg:px-12 pb-16">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl md:text-3xl font-bold text-white">{exploreView.title}</h1>
                  <button
                    onClick={handleCloseExplore}
                    className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-500 text-sm mb-6">{exploreView.items.length} titles</p>
                {renderGrid(exploreView.items)}
                {exploreView.key && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleLoadMoreExplore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {loadingMore ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Navbar
          onSearch={handleSearch}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* ── SEARCH RESULTS ── */}
        {searchQuery.length >= 2 ? (
          <div className="pt-24 md:pt-28 px-4 md:px-8 lg:px-12 pb-12">
            <h1 className="text-xl md:text-3xl font-bold text-white mb-2">
              {searchResults.length > 0 ? `Results for "${searchQuery}"` : `No results for "${searchQuery}"`}
            </h1>
            <p className="text-gray-500 text-sm mb-6">{searchResults.length} titles found</p>
            {searchResults.length > 0
              ? renderGrid(searchResults)
              : <p className="text-gray-500">Try a different title or genre.</p>
            }
          </div>

        ) : activeTab === "mylist" ? (
          /* ── MY LIST ── */
          <div className="pt-24 md:pt-28 px-4 md:px-8 lg:px-12 pb-12 space-y-12">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-white mb-2">My List</h1>
              <p className="text-gray-500 text-sm mb-6">{myList.length} titles saved</p>
              {myList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="text-white text-lg font-semibold">Your list is empty</p>
                  <p className="text-gray-500 mt-2 text-sm">Add shows and movies by clicking the + button on any title</p>
                </div>
              ) : renderGrid(myList)}
            </div>

            {history.length > 0 && (
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-white mb-2">🕒 Continue Watching</h2>
                <p className="text-gray-500 text-sm mb-6">{history.length} titles played recently</p>
                {renderGrid(history)}
              </div>
            )}

            {likedItems.length > 0 && (
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-white mb-2">👍 Liked</h2>
                <p className="text-gray-500 text-sm mb-6">{likedItems.length} titles liked</p>
                {renderGrid(likedItems)}
              </div>
            )}
          </div>

        ) : activeTab === "language" ? (
          /* ── BROWSE BY LANGUAGE ── */
          <div className="pt-24 md:pt-28 pb-12">
            <div className="px-4 md:px-8 lg:px-12 mb-6">
              <h1 className="text-xl md:text-3xl font-bold text-white">Browse by Language</h1>
              <p className="text-gray-500 mt-1 text-sm">Discover content in your preferred language</p>
            </div>
            {loading ? <LoadingSpinner /> : (
              <>
                <ContentRow title="🇮🇳 Hindi" items={rows.hindiContent || []} delay={0} onOpenModal={handleOpenModal}  rowKey="hindiContent" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="🇰🇷 Korean" items={rows.koreanContent || []} delay={1} onOpenModal={handleOpenModal}  rowKey="koreanContent" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="🇪🇸 Spanish" items={rows.spanishContent || []} delay={2} onOpenModal={handleOpenModal}  rowKey="spanishContent" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="🇯🇵 Japanese" items={rows.japaneseContent || []} delay={3} onOpenModal={handleOpenModal}  rowKey="japaneseContent" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
              </>
            )}
          </div>

        ) : activeTab === "tvshows" ? (
          /* ── TV SHOWS ── */
          <div className="pt-24 md:pt-28 pb-12">
            <div className="px-4 md:px-8 lg:px-12 mb-6">
              <h1 className="text-xl md:text-3xl font-bold text-white">TV Shows</h1>
              <p className="text-gray-500 mt-1 text-sm">Series, dramas, and more</p>
            </div>
            {loading ? <LoadingSpinner /> : (
              <>
                <ContentRow title="Popular TV Shows" items={rows.popularTV || []} delay={0} onOpenModal={handleOpenModal}  rowKey="popularTV" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="Top Rated Series" items={rows.topRatedTV || []} isLarge delay={1} onOpenModal={handleOpenModal}  rowKey="topRatedTV" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="Sci-Fi & Fantasy" items={rows.scifiShows || []} delay={2} onOpenModal={handleOpenModal}  rowKey="scifiShows" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="Crime & Thriller" items={rows.crimeShows || []} delay={3} onOpenModal={handleOpenModal}  rowKey="crimeShows" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="Korean Dramas 🇰🇷" items={rows.koreanContent || []} delay={4} onOpenModal={handleOpenModal}  rowKey="koreanContent" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
              </>
            )}
          </div>

        ) : activeTab === "movies" ? (
          /* ── MOVIES ── */
          <div className="pt-24 md:pt-28 pb-12">
            <div className="px-4 md:px-8 lg:px-12 mb-6">
              <h1 className="text-xl md:text-3xl font-bold text-white">Movies</h1>
              <p className="text-gray-500 mt-1 text-sm">Blockbusters, indie films, and more</p>
            </div>
            {loading ? <LoadingSpinner /> : (
              <>
                <ContentRow title="Popular Movies" items={rows.popularMovies || []} delay={0} onOpenModal={handleOpenModal}  rowKey="popularMovies" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="Top Rated Movies" items={rows.topRatedMovies || []} isLarge delay={1} onOpenModal={handleOpenModal}  rowKey="topRatedMovies" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="Action & Adventure" items={rows.actionMovies || []} delay={2} onOpenModal={handleOpenModal}  rowKey="actionMovies" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="Horror" items={rows.horrorMovies || []} delay={3} onOpenModal={handleOpenModal}  rowKey="horrorMovies" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="Comedy" items={rows.comedyMovies || []} delay={4} onOpenModal={handleOpenModal}  rowKey="comedyMovies" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                <ContentRow title="Hindi Movies 🇮🇳" items={rows.hindiContent || []} delay={5} onOpenModal={handleOpenModal}  rowKey="hindiContent" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
              </>
            )}
          </div>

        ) : (
          /* ── HOME ── */
          <>
            <HeroBanner
              title={heroContent.title}
              description={heroContent.description}
              imageUrl={heroContent.imageUrl}
              onOpenModal={() => handleOpenModal(heroItem)}
              onPlay={addToHistory}
            />
            <div className="relative z-10 -mt-32 md:-mt-40 space-y-1 md:space-y-2 pb-8">
              {loading ? <LoadingSpinner /> : (
                <>
                  <ContentRow title="Trending Now 🔥" items={rows.trendingNow || []} delay={0} onOpenModal={handleOpenModal}  rowKey="trendingNow" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  <ContentRow title="Popular TV Shows" items={rows.popularTV || []} delay={1} onOpenModal={handleOpenModal}  rowKey="popularTV" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  <ContentRow title="Popular Movies" items={rows.popularMovies || []} delay={2} onOpenModal={handleOpenModal}  rowKey="popularMovies" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  <ContentRow title="Top Rated TV Shows" items={rows.topRatedTV || []} isLarge delay={3} onOpenModal={handleOpenModal}  rowKey="topRatedTV" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  <ContentRow title="Top Rated Movies" items={rows.topRatedMovies || []} isLarge delay={4} onOpenModal={handleOpenModal}  rowKey="topRatedMovies" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  <ContentRow title="Action & Adventure" items={rows.actionMovies || []} delay={5} onOpenModal={handleOpenModal}  rowKey="actionMovies" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  <ContentRow title="Sci-Fi & Fantasy" items={rows.scifiShows || []} delay={6} onOpenModal={handleOpenModal}  rowKey="scifiShows" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  <ContentRow title="Horror" items={rows.horrorMovies || []} delay={7} onOpenModal={handleOpenModal}  rowKey="horrorMovies" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  <ContentRow title="Comedy" items={rows.comedyMovies || []} delay={8} onOpenModal={handleOpenModal}  rowKey="comedyMovies" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  <ContentRow title="Korean Dramas 🇰🇷" items={rows.koreanContent || []} delay={9} onOpenModal={handleOpenModal}  rowKey="koreanContent" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  <ContentRow title="Spanish Content 🇪🇸" items={rows.spanishContent || []} delay={10} onOpenModal={handleOpenModal}  rowKey="spanishContent" onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  {myList.length > 0 && (
                    <ContentRow title="❤️ My List" items={myList} delay={11} onOpenModal={handleOpenModal}  onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  )}
                  {history.length > 0 && (
                    <ContentRow title="🕒 Continue Watching" items={history} delay={12} onOpenModal={handleOpenModal} onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  )}
                  {likedItems.length > 0 && (
                    <ContentRow title="👍 Liked" items={likedItems} delay={13} onOpenModal={handleOpenModal} onPlay={addToHistory} isLiked={isLikedItem} onToggleLike={toggleLiked} isInMyList={isInMyList} onToggleMyList={toggleMyList} onExploreAll={handleExploreAll} />
                  )}
                </>
              )}
            </div>
          </>
        )}

        <Footer />
      </main>
    </>
  )
}

export default function NetflixHomePage() {
  return (
    <SettingsProvider>
      <NetflixContent />
    </SettingsProvider>
  )
}
