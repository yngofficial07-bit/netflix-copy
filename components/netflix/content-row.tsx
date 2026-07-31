"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ContentCard } from "./content-card"
import { useSettings, animationDurations, rowGaps, accentColors } from "./settings-context"

export interface ContentItem {
  id: number
  tmdbId?: number
  mediaType?: "tv" | "movie"
  title: string
  imageUrl: string
  backdropUrl?: string
  overview?: string
  match?: number
  isNew?: boolean
  seasons?: number
  duration?: string
  genres?: string[]
  ageRating?: string
}

interface ContentRowProps {
  title: string
  items: ContentItem[]
  isLarge?: boolean
  delay?: number
  onOpenModal?: (item: ContentItem) => void
}

export function ContentRow({ title, items, isLarge = false, delay = 0, onOpenModal }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const { settings } = useSettings()

  const duration = settings.reducedMotion ? 0 : animationDurations[settings.animationSpeed]
  const gapClass = rowGaps[settings.rowDensity]
  const accentColor = accentColors[settings.accentColor].primary

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasAnimated) setHasAnimated(true) },
      { threshold: 0.1 }
    )
    if (rowRef.current) observer.observe(rowRef.current)
    return () => observer.disconnect()
  }, [hasAnimated])

  const handleScroll = () => {
    if (!rowRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
    setShowLeft(scrollLeft > 10)
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return
    rowRef.current.scrollBy({
      left: dir === "left" ? -rowRef.current.clientWidth * 0.85 : rowRef.current.clientWidth * 0.85,
      behavior: "smooth",
    })
  }

  if (!items || items.length === 0) return null

  return (
    <motion.div
      initial={settings.reducedMotion ? {} : { opacity: 0, y: 30 }}
      animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: duration * 1.5, delay: delay * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative group/row py-2 md:py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Row Title */}
      <motion.div
        className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 px-4 md:px-8 lg:px-12"
        initial={settings.reducedMotion ? {} : { x: -20, opacity: 0 }}
        animate={hasAnimated ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: duration * 1.2, delay: delay * 0.1 + 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h2 className="text-base md:text-xl lg:text-2xl font-bold text-white">{title}</h2>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="text-xs md:text-sm font-medium flex items-center gap-1 cursor-pointer hover:underline"
          style={{ color: accentColor }}
        >
          Explore All <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
        </motion.span>
      </motion.div>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
        <AnimatePresence>
          {showLeft && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => scroll("left")}
              className="absolute left-0 top-0 bottom-6 md:bottom-8 z-30 w-10 md:w-16 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
              style={{ background: "linear-gradient(to right, rgba(0,0,0,0.95), transparent)" }}
            >
              <div className="p-1.5 md:p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                <ChevronLeft className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right Arrow */}
        <AnimatePresence>
          {showRight && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => scroll("right")}
              className="absolute right-0 top-0 bottom-6 md:bottom-8 z-30 w-10 md:w-16 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
              style={{ background: "linear-gradient(to left, rgba(0,0,0,0.95), transparent)" }}
            >
              <div className="p-1.5 md:p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                <ChevronRight className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Items */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className={`flex ${gapClass} overflow-x-scroll hide-scrollbar px-4 md:px-8 lg:px-12 pb-6 md:pb-8 scroll-smooth`}
        >
          {items.map((item, index) => (
            <ContentCard
              key={item.id}
              item={item}
              isLarge={isLarge}
              index={index}
              animationDelay={hasAnimated ? index * 0.02 : 0}
              onOpenModal={onOpenModal}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
