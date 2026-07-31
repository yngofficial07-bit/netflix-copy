"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface UserSettings {
  accentColor: "red" | "blue" | "green" | "purple" | "gold" | "cyan" | "orange" | "pink"
  cardStyle: "default" | "rounded" | "glass" | "neon"
  animationSpeed: "slow" | "normal" | "fast"
  rowDensity: "compact" | "comfortable" | "spacious"
  autoplay: boolean
  showTitles: boolean
  showTopTen: boolean
  enableSound: boolean
  reducedMotion: boolean
  compactMode: boolean
  backgroundEffects: boolean
}

const defaultSettings: UserSettings = {
  accentColor: "red",
  cardStyle: "default",
  animationSpeed: "normal",
  rowDensity: "comfortable",
  autoplay: true,
  showTitles: true,
  showTopTen: true,
  enableSound: false,
  reducedMotion: false,
  compactMode: false,
  backgroundEffects: true,
}

interface SettingsContextType {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
  isSettingsOpen: boolean
  setIsSettingsOpen: (open: boolean) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("netflix-settings")
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("netflix-settings", JSON.stringify(settings))
    }
  }, [settings, mounted])

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem("netflix-settings")
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isSettingsOpen, setIsSettingsOpen, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("useSettings must be used within SettingsProvider")
  return context
}

export const accentColors = {
  red: { primary: "#E50914", glow: "rgba(229, 9, 20, 0.5)", gradient: "from-red-600 to-red-900" },
  blue: { primary: "#0071EB", glow: "rgba(0, 113, 235, 0.5)", gradient: "from-blue-600 to-blue-900" },
  green: { primary: "#46D369", glow: "rgba(70, 211, 105, 0.5)", gradient: "from-green-500 to-green-800" },
  purple: { primary: "#9B59B6", glow: "rgba(155, 89, 182, 0.5)", gradient: "from-purple-600 to-purple-900" },
  gold: { primary: "#F5C518", glow: "rgba(245, 197, 24, 0.5)", gradient: "from-yellow-500 to-amber-700" },
  cyan: { primary: "#00D4FF", glow: "rgba(0, 212, 255, 0.5)", gradient: "from-cyan-400 to-cyan-700" },
  orange: { primary: "#FF6B35", glow: "rgba(255, 107, 53, 0.5)", gradient: "from-orange-500 to-orange-800" },
  pink: { primary: "#FF1493", glow: "rgba(255, 20, 147, 0.5)", gradient: "from-pink-500 to-pink-800" },
}

export const animationDurations = {
  slow: 0.6,
  normal: 0.35,
  fast: 0.15,
}

export const rowGaps = {
  compact: "gap-1 md:gap-2",
  comfortable: "gap-2 md:gap-3",
  spacious: "gap-3 md:gap-5",
}
