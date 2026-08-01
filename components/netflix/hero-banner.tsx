import { motion, AnimatePresence } from "framer-motion"
import { Play, Info, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useSettings, accentColors, animationDurations } from "./settings-context"
import type { ContentItem } from "./content-row"

const API_KEY = "51e8f6fa27967e18cd00a4e246cb4b6b"

interface HeroBannerProps {
  title: string
  description: string
  imageUrl: string
  onOpenModal?: () => void
  onPlay?: (item: ContentItem) => void
}

interface HeroItem {
  id: number
  tmdbId: number
  title: string
  description: string
  imageUrl: string
  mediaType: "tv" | "movie"
  match?: number
}

export function HeroBanner({ title, description, imageUrl, onOpenModal, onPlay }: HeroBannerProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [heroItems, setHeroItems] = useState<HeroItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const { settings } = useSettings()
  const accentColor = accentColors[settings.accentColor].primary
  const duration = settings.reducedMotion ? 0 : animationDurations[settings.animationSpeed]

  // Fetch trending items for hero slideshow
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/all/week?language=en-US&api_key=${API_KEY}`)
        const data = await res.json()
        const items = (data.results || [])
          .filter((i: any) => i.media_type !== "person" && i.backdrop_path)
          .slice(0, 5)
          .map((i: any) => ({
            id: i.id,
            tmdbId: i.id,
            title: i.title || i.name || "Unknown",
            description: i.overview || "",
            imageUrl: `https://image.tmdb.org/t/p/original${i.backdrop_path}`,
            mediaType: (i.media_type === "movie" ? "movie" : "tv") as "tv" | "movie",
            match: i.vote_average ? Math.round(i.vote_average * 10) : 90,
          }))
        // Put Stranger Things as first item
        const defaultItem: HeroItem = {
          id: 66732, tmdbId: 66732, title, description,
          imageUrl, mediaType: "tv", match: 98
        }
        setHeroItems([defaultItem, ...items.filter((i: any) => i.id !== 66732)])
      } catch {
        setHeroItems([{ id: 66732, tmdbId: 66732, title, description, imageUrl, mediaType: "tv", match: 98 }])
      }
    }
    fetchHero()
  }, [title, description, imageUrl])

  // Auto-slide every 7 seconds
  useEffect(() => {
    if (!isAutoPlaying || heroItems.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex(i => (i + 1) % heroItems.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, heroItems.length])

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(idx)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 12000)
  }, [])

  const prev = () => goTo((currentIndex - 1 + heroItems.length) % heroItems.length)
  const next = () => goTo((currentIndex + 1) % heroItems.length)

  const current = heroItems[currentIndex]
  if (!current) return null

  const handlePlay = () => {
    onPlay?.({
      id: current.id, tmdbId: current.tmdbId, mediaType: current.mediaType,
      title: current.title, imageUrl: current.imageUrl, match: current.match,
    })
    window.location.href = `https://auraflix-junction.vercel.app/index.html?id=${current.tmdbId}&type=${current.mediaType}`
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "100vh", maxHeight: "860px", minHeight: "560px" }}>
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <motion.div
            animate={{ scale: [1, 1.05] }}
            transition={{ duration: 10, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${current.imageUrl})` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute inset-0 opacity-10"
          style={{ background: `linear-gradient(135deg, ${accentColor}30, transparent)` }} />
      </div>

      {/* Particles */}
      {settings.backgroundEffects && !settings.reducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {[...Array(12)].map((_, i) => (
            <motion.div key={i}
              initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: 0 }}
              animate={{ y: [null, "-30%"], opacity: [0, 0.3, 0] }}
              transition={{ duration: 10 + Math.random() * 8, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
              className="absolute w-1 h-1 rounded-full bg-white/30"
              style={{ filter: "blur(1px)" }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-end px-4 md:px-8 lg:px-12 pb-28 sm:pb-32 md:pb-36 lg:pb-40">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-xl lg:max-w-2xl space-y-3 md:space-y-5"
          >
            {/* Badge */}
            <motion.div className="flex items-center gap-3">
              <motion.div
                animate={{ boxShadow: [`0 0 20px ${accentColor}60`, `0 0 40px ${accentColor}30`, `0 0 20px ${accentColor}60`] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-2 md:px-3 py-0.5 md:py-1 rounded text-xs font-bold tracking-wider"
                style={{ backgroundColor: accentColor }}
              >
                <span className="text-white">N</span>
              </motion.div>
              <span className="text-xs md:text-sm tracking-[0.2em] text-gray-300 font-semibold uppercase">
                {current.mediaType === "movie" ? "Film" : "Series"}
              </span>
              {current.match && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  {current.match}% Match
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-none"
              style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
            >
              {current.title}
            </motion.h1>

            {/* Description */}
            <motion.p className="text-sm md:text-base lg:text-lg text-gray-200 line-clamp-2 md:line-clamp-3 max-w-md lg:max-w-xl leading-relaxed">
              {current.description}
            </motion.p>

            {/* Buttons */}
            <motion.div className="flex items-center gap-2 md:gap-4 pt-1 md:pt-2 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                onClick={handlePlay}
                className="flex items-center gap-1.5 md:gap-2 bg-white text-black px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded-md font-bold text-sm md:text-base lg:text-lg hover:bg-white/90 transition-colors shadow-xl"
              >
                <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                <span>Play</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                onClick={onOpenModal}
                className="flex items-center gap-1.5 md:gap-2 bg-gray-500/50 backdrop-blur-sm text-white px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded-md font-semibold text-sm md:text-base lg:text-lg transition-colors"
              >
                <Info className="h-4 w-4 md:h-5 md:w-5" />
                <span>More Info</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Controls */}
      {heroItems.length > 1 && (
        <>
          {/* Prev/Next arrows */}
          <button onClick={prev}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60 transition-all text-white">
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button onClick={next}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60 transition-all text-white">
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {heroItems.map((_, idx) => (
              <button key={idx} onClick={() => goTo(idx)}
                className={`transition-all duration-300 rounded-full ${idx === currentIndex ? "w-6 h-2" : "w-2 h-2 bg-white/40 hover:bg-white/60"}`}
                style={idx === currentIndex ? { backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` } : {}}
              />
            ))}
          </div>
        </>
      )}

      {/* Mute button */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="absolute bottom-24 right-4 md:right-8 lg:right-12 z-30 flex items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 md:p-3 rounded-full border border-white/40 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
        >
          {isMuted ? <VolumeX className="h-4 w-4 md:h-5 md:w-5 text-white" /> : <Volume2 className="h-4 w-4 md:h-5 md:w-5 text-white" />}
        </motion.button>
        <div className="flex items-center bg-black/40 backdrop-blur-sm border-l-2 border-white/80 px-2 md:px-4 py-1 md:py-2">
          <span className="text-white font-medium text-xs md:text-sm">16+</span>
        </div>
      </motion.div>

    </div>
  )
}
