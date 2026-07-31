"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Plus, ThumbsUp, Volume2, VolumeX, Check, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useSettings, accentColors } from "./settings-context"
import type { ContentItem } from "./content-row"

interface VideoModalProps {
  item: ContentItem | null
  isOpen: boolean
  onClose: () => void
  isInMyList?: (id: number) => boolean
  onToggleMyList?: (item: ContentItem) => void
}

export function VideoModal({ item, isOpen, onClose, isInMyList, onToggleMyList }: VideoModalProps) {
  const [isLiked, setIsLiked] = useState<"like" | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [showMoreEpisodes, setShowMoreEpisodes] = useState(false)
  const { settings } = useSettings()
  const accentColor = accentColors[settings.accentColor].primary

  if (!item) return null

  const inMyList = isInMyList?.(item.id) || false

  const handlePlay = () => {
    const id = item.tmdbId || item.id
    const type = item.mediaType || "tv"
    window.location.href = `https://auraflix-junction.vercel.app/index.html?id=${id}&type=${type}`
  }

  const episodes = Array.from({ length: 10 }, (_, i) => ({
    number: i + 1,
    title: `Episode ${i + 1}`,
    duration: `${42 + Math.floor(Math.random() * 20)}m`,
    description: "When unexpected events unfold, our heroes must face their greatest challenge yet.",
  }))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[80]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-4 md:inset-8 lg:inset-y-8 lg:left-[10%] lg:right-[10%] bg-[#181818] rounded-xl z-[90] overflow-hidden flex flex-col"
            style={{ maxHeight: "92vh" }}
          >
            {/* Close */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </motion.button>

            <div className="overflow-y-auto flex-1 overscroll-contain">
              {/* Banner */}
              <div className="relative aspect-video">
                <Image
                  src={item.backdropUrl || item.imageUrl} alt={item.title}
                  fill className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/50 to-transparent" />

                {/* Play overlay */}
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-5 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40"
                  >
                    <Play className="h-12 w-12 md:h-16 md:w-16 text-white fill-white" />
                  </motion.div>
                </motion.button>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-5"
                    style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
                    {item.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {/* Play */}
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={handlePlay}
                      className="flex items-center gap-2 bg-white text-black px-5 md:px-8 py-2 md:py-3 rounded-md font-bold text-sm md:text-lg hover:bg-white/90 transition-colors shadow-xl"
                    >
                      <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                      <span>Play</span>
                    </motion.button>

                    {/* My List */}
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => onToggleMyList?.(item)}
                      className={`p-2.5 md:p-3 rounded-full border-2 transition-all ${
                        inMyList ? "bg-white/20 border-white" : "border-gray-400 hover:border-white bg-black/40"
                      }`}
                    >
                      {inMyList
                        ? <Check className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        : <Plus className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      }
                    </motion.button>

                    {/* Like */}
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setIsLiked(isLiked === "like" ? null : "like")}
                      className={`p-2.5 md:p-3 rounded-full border-2 transition-all ${
                        isLiked === "like" ? "bg-white/20 border-white" : "border-gray-400 hover:border-white bg-black/40"
                      }`}
                    >
                      <ThumbsUp className={`h-4 w-4 md:h-5 md:w-5 ${isLiked === "like" ? "text-white fill-white" : "text-white"}`} />
                    </motion.button>

                    <div className="flex-1" />

                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2.5 md:p-3 rounded-full border border-white/40 bg-black/40 hover:bg-black/60 transition-colors"
                    >
                      {isMuted
                        ? <VolumeX className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        : <Volume2 className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      }
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 md:p-8 space-y-6">
                <div className="grid md:grid-cols-[2fr_1fr] gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {item.match && (
                        <span className="font-bold" style={{ color: item.match > 80 ? "#46D369" : "#FFC107" }}>
                          {item.match}% Match
                        </span>
                      )}
                      <span className="border border-gray-500 px-2 py-0.5 text-gray-300 text-xs">{item.ageRating || "TV-MA"}</span>
                      {item.seasons && <span className="text-gray-300">{item.seasons} Seasons</span>}
                      {item.duration && <span className="text-gray-300">{item.duration}</span>}
                      <span className="border border-gray-500 px-2 py-0.5 text-gray-400 text-xs">HD</span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{
                          background: item.mediaType === "movie" ? "#f59e0b20" : "#ef444420",
                          color: item.mediaType === "movie" ? "#fbbf24" : "#fca5a5",
                        }}>
                        {item.mediaType === "movie" ? "🎬 Movie" : "📺 TV Show"}
                      </span>
                    </div>
                    <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                      {item.overview || "An exciting story that will keep you on the edge of your seat."}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    {item.genres && item.genres.length > 0 && (
                      <div>
                        <span className="text-gray-500">Genres: </span>
                        <span className="text-gray-200">{item.genres.join(", ")}</span>
                      </div>
                    )}
                    {item.match && (
                      <div>
                        <span className="text-gray-500">Match: </span>
                        <span style={{ color: "#46D369" }}>{item.match}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Episodes — TV only */}
                {item.mediaType !== "movie" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl md:text-2xl font-bold text-white">Episodes</h3>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
                        Season 1 <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {episodes.slice(0, showMoreEpisodes ? 10 : 4).map((ep, i) => (
                        <motion.div
                          key={ep.number}
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => {
                            const id = item.tmdbId || item.id
                            window.location.href = `https://auraflix-junction.vercel.app/index.html?id=${id}&type=tv&s=1&e=${ep.number}`
                          }}
                          className="flex gap-4 p-3 md:p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                          <div className="relative w-28 md:w-40 aspect-video rounded-md overflow-hidden flex-shrink-0">
                            <Image src={item.imageUrl} alt={ep.title} fill className="object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-8 w-8 text-white fill-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm md:text-base">{ep.number}. {ep.title}</h4>
                            <p className="text-gray-400 text-xs">{ep.duration}</p>
                            <p className="text-gray-500 text-xs mt-1 line-clamp-2 hidden sm:block">{ep.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {!showMoreEpisodes && (
                      <button onClick={() => setShowMoreEpisodes(true)}
                        className="w-full py-3 rounded-md border border-white/20 text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                        Show More <ChevronDown className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
