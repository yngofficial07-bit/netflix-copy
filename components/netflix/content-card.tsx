"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Plus, ThumbsUp, ChevronDown, Check } from "lucide-react"
import type { ContentItem } from "./content-row"
import { useSettings, accentColors, animationDurations } from "./settings-context"

interface ContentCardProps {
  item: ContentItem
  isLarge?: boolean
  index: number
  animationDelay?: number
  onOpenModal?: (item: ContentItem) => void
}

export function ContentCard({ item, isLarge = false, index, animationDelay = 0, onOpenModal }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isInList, setIsInList] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const { settings } = useSettings()

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches)
  }, [])

  useEffect(() => {
    if (!isTouch || !isHovered) return
    const handleOutside = (e: TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setIsHovered(false)
    }
    document.addEventListener("touchstart", handleOutside)
    return () => document.removeEventListener("touchstart", handleOutside)
  }, [isTouch, isHovered])

  const duration = settings.reducedMotion ? 0 : animationDurations[settings.animationSpeed]
  const accentColor = accentColors[settings.accentColor].primary
  const glowColor = accentColors[settings.accentColor].glow

  const getBorderRadius = () => {
    switch (settings.cardStyle) {
      case "rounded": return "rounded-xl"
      case "glass":   return "rounded-lg"
      case "neon":    return "rounded-md"
      default:        return "rounded-sm"
    }
  }

  const cardWidth = settings.compactMode
    ? isLarge ? "w-[140px] md:w-[200px]" : "w-[120px] md:w-[180px]"
    : isLarge ? "w-[160px] md:w-[260px]" : "w-[140px] md:w-[220px]"

  const handlePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const id = item.tmdbId || item.id
    const type = item.mediaType || "tv"
    window.location.href = `https://auraflix-junction.vercel.app/index.html?id=${id}&type=${type}`
  }

  const handleClick = () => {
    if (isTouch && !isHovered) {
      setIsHovered(true)
      return
    }
    if (onOpenModal) onOpenModal(item)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay: animationDelay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`relative flex-shrink-0 cursor-pointer ${cardWidth}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Top 10 badge */}
      {settings.showTopTen && index < 10 && !isLarge && (
        <div className="absolute -left-1 md:-left-3 bottom-0 z-10 flex items-end pointer-events-none">
          <span
            className="text-[50px] md:text-[80px] font-black leading-none select-none"
            style={{ WebkitTextStroke: `2px ${accentColor}`, color: "transparent", textShadow: `0 0 30px ${glowColor}` }}
          >
            {index + 1}
          </span>
        </div>
      )}

      <motion.div
        animate={settings.reducedMotion ? {} : { scale: isHovered ? 1.2 : 1, zIndex: isHovered ? 50 : 1, y: isHovered ? -20 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 32, mass: 0.6 }}
        className={`relative overflow-visible ${getBorderRadius()}`}
        style={{ boxShadow: isHovered ? `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${glowColor}` : "0 4px 20px rgba(0,0,0,0.3)" }}
      >
        {/* Image */}
        <div className={`relative overflow-hidden ${getBorderRadius()}`}>
          <Image
            src={imageError ? "https://via.placeholder.com/220x124?text=No+Image" : item.imageUrl}
            alt={item.title}
            width={isLarge ? 260 : 220}
            height={isLarge ? 390 : 124}
            className={`object-cover transition-transform duration-300 ease-out w-full ${isLarge ? "aspect-[2/3]" : "aspect-video"} ${isHovered && !settings.reducedMotion ? "scale-110" : ""}`}
            onError={() => setImageError(true)}
          />

          {/* New badge */}
          {item.isNew && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded text-white"
              style={{ backgroundColor: accentColor }}
            >NEW</motion.div>
          )}

          {/* Hover play */}
          <AnimatePresence>
            {isHovered && !settings.reducedMotion && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: duration * 0.6, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center bg-black/30"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="p-3 rounded-full bg-white/20 backdrop-blur-sm"
                  onClick={handlePlay}
                >
                  <Play className="h-8 w-8 text-white fill-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hover card */}
        <AnimatePresence>
          {isHovered && !settings.reducedMotion && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: duration * 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className={`absolute left-0 right-0 top-full bg-[#181818] ${getBorderRadius()} shadow-2xl border border-white/10 overflow-hidden`}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-3 md:p-4 space-y-3">
                <div className="flex items-center gap-1.5 md:gap-2">
                  {/* Play */}
                  <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                    onClick={handlePlay}
                    className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg"
                  >
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </motion.button>

                  {/* Add to list */}
                  <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                    onClick={e => { e.stopPropagation(); setIsInList(!isInList) }}
                    className={`h-8 w-8 md:h-9 md:w-9 rounded-full border-2 flex items-center justify-center transition-all ${isInList ? "bg-white/20 border-white" : "border-gray-500 hover:border-white"}`}
                  >
                    {isInList ? <Check className="h-3.5 w-3.5 text-white" /> : <Plus className="h-3.5 w-3.5 text-white" />}
                  </motion.button>

                  {/* Like */}
                  <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                    onClick={e => { e.stopPropagation(); setIsLiked(!isLiked) }}
                    className={`h-8 w-8 md:h-9 md:w-9 rounded-full border-2 flex items-center justify-center transition-all ${isLiked ? "border-white" : "border-gray-500 hover:border-white"}`}
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? "text-white fill-white" : "text-white"}`} />
                  </motion.button>

                  <div className="flex-1" />

                  {/* More info */}
                  <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                    onClick={e => { e.stopPropagation(); handleClick() }}
                    className="h-8 w-8 md:h-9 md:w-9 rounded-full border-2 border-gray-500 hover:border-white flex items-center justify-center transition-all"
                  >
                    <ChevronDown className="h-3.5 w-3.5 text-white" />
                  </motion.button>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs flex-wrap">
                  {item.match && (
                    <span className="font-bold" style={{ color: item.match > 90 ? "#46D369" : item.match > 70 ? "#8BC34A" : "#FFC107" }}>
                      {item.match}% Match
                    </span>
                  )}
                  {item.ageRating && (
                    <span className="border border-gray-500 px-1.5 py-0.5 text-gray-300 text-[9px]">{item.ageRating}</span>
                  )}
                  {item.seasons && <span className="text-gray-300">{item.seasons} Seasons</span>}
                  {item.duration && <span className="text-gray-300">{item.duration}</span>}
                  <span className="border border-gray-500 px-1.5 py-0.5 text-gray-400 text-[9px]">HD</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                    style={{ background: item.mediaType === "movie" ? "#f59e0b20" : "#ef444420", color: item.mediaType === "movie" ? "#fbbf24" : "#fca5a5" }}>
                    {item.mediaType === "movie" ? "🎬" : "📺"}
                  </span>
                </div>

                {/* Genres */}
                {item.genres && item.genres.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-300 flex-wrap">
                    {item.genres.slice(0, 3).map((genre, i) => (
                      <span key={genre} className="flex items-center">
                        <span className="hover:text-white transition-colors">{genre}</span>
                        {i < Math.min(item.genres!.length, 3) - 1 && <span className="mx-1 w-1 h-1 rounded-full bg-gray-500 inline-block" />}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Title below card */}
      {settings.showTitles && !isHovered && !isLarge && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: animationDelay + 0.2 }}
          className="mt-2 text-xs md:text-sm text-gray-400 truncate hover:text-white transition-colors"
        >
          {item.title}
        </motion.p>
      )}
    </motion.div>
  )
}
