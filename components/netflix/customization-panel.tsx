"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Palette, Layers, Zap, Grid3X3, Play, Type, RotateCcw, Sparkles, Volume2, Eye, Monitor } from "lucide-react"
import { useSettings, accentColors, type UserSettings } from "./settings-context"

export function CustomizationPanel() {
  const { settings, updateSettings, isSettingsOpen, setIsSettingsOpen, resetSettings } = useSettings()

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            onClick={() => setIsSettingsOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-gradient-to-b from-[#141414] via-[#0a0a0a] to-black border-l border-white/10 z-[70] overflow-y-auto overscroll-contain"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-b from-[#141414] via-[#141414] to-transparent p-6 pb-10 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="p-2 rounded-xl bg-gradient-to-br from-white/10 to-white/5"
                  >
                    <Sparkles className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Customize</h2>
                    <p className="text-sm text-gray-400">Personalize your experience</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </motion.button>
              </div>
            </div>

            <div className="px-6 pb-32 space-y-8">
              {/* Accent Color */}
              <SettingSection icon={<Palette className="h-5 w-5" />} title="Theme Color" description="Choose your accent color">
                <div className="grid grid-cols-4 gap-3">
                  {(Object.keys(accentColors) as Array<UserSettings["accentColor"]>).map((color) => (
                    <motion.button
                      key={color}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateSettings({ accentColor: color })}
                      className={`aspect-square rounded-xl relative transition-all overflow-hidden group ${
                        settings.accentColor === color 
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]" 
                          : "hover:ring-1 hover:ring-white/30"
                      }`}
                      style={{ 
                        backgroundColor: accentColors[color].primary,
                        boxShadow: settings.accentColor === color ? `0 0 30px ${accentColors[color].glow}` : "none"
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {settings.accentColor === color && (
                        <motion.div
                          layoutId="accent-check"
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        </motion.div>
                      )}
                      <span className="absolute bottom-1 left-0 right-0 text-[10px] text-white/80 text-center capitalize font-medium">
                        {color}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </SettingSection>

              {/* Card Style */}
              <SettingSection icon={<Layers className="h-5 w-5" />} title="Card Style" description="Customize card appearance">
                <div className="grid grid-cols-2 gap-3">
                  {(["default", "rounded", "glass", "neon"] as const).map((style) => (
                    <StyleButton
                      key={style}
                      label={style.charAt(0).toUpperCase() + style.slice(1)}
                      description={getStyleDescription(style)}
                      active={settings.cardStyle === style}
                      onClick={() => updateSettings({ cardStyle: style })}
                    />
                  ))}
                </div>
              </SettingSection>

              {/* Animation Speed */}
              <SettingSection icon={<Zap className="h-5 w-5" />} title="Animation Speed" description="Control transition speed">
                <div className="grid grid-cols-3 gap-3">
                  {(["slow", "normal", "fast"] as const).map((speed) => (
                    <SpeedButton
                      key={speed}
                      label={speed.charAt(0).toUpperCase() + speed.slice(1)}
                      active={settings.animationSpeed === speed}
                      onClick={() => updateSettings({ animationSpeed: speed })}
                      speed={speed}
                    />
                  ))}
                </div>
              </SettingSection>

              {/* Row Density */}
              <SettingSection icon={<Grid3X3 className="h-5 w-5" />} title="Content Density" description="Adjust spacing between items">
                <div className="grid grid-cols-3 gap-3">
                  {(["compact", "comfortable", "spacious"] as const).map((density) => (
                    <DensityButton
                      key={density}
                      label={density.charAt(0).toUpperCase() + density.slice(1)}
                      active={settings.rowDensity === density}
                      onClick={() => updateSettings({ rowDensity: density })}
                      density={density}
                    />
                  ))}
                </div>
              </SettingSection>

              {/* Playback Settings */}
              <SettingSection icon={<Play className="h-5 w-5" />} title="Playback" description="Video and preview settings">
                <div className="space-y-4">
                  <Toggle
                    label="Autoplay Previews"
                    description="Play trailers on hover"
                    enabled={settings.autoplay}
                    onChange={(v) => updateSettings({ autoplay: v })}
                  />
                  <Toggle
                    label="Sound Effects"
                    description="Enable UI sounds"
                    enabled={settings.enableSound}
                    onChange={(v) => updateSettings({ enableSound: v })}
                  />
                </div>
              </SettingSection>

              {/* Display Settings */}
              <SettingSection icon={<Type className="h-5 w-5" />} title="Display" description="Visual preferences">
                <div className="space-y-4">
                  <Toggle
                    label="Show Titles"
                    description="Display titles below cards"
                    enabled={settings.showTitles}
                    onChange={(v) => updateSettings({ showTitles: v })}
                  />
                  <Toggle
                    label="Top 10 Badges"
                    description="Show ranking numbers"
                    enabled={settings.showTopTen}
                    onChange={(v) => updateSettings({ showTopTen: v })}
                  />
                  <Toggle
                    label="Background Effects"
                    description="Animated particles & bokeh"
                    enabled={settings.backgroundEffects}
                    onChange={(v) => updateSettings({ backgroundEffects: v })}
                  />
                </div>
              </SettingSection>

              {/* Accessibility */}
              <SettingSection icon={<Eye className="h-5 w-5" />} title="Accessibility" description="Improve usability">
                <div className="space-y-4">
                  <Toggle
                    label="Reduced Motion"
                    description="Minimize animations"
                    enabled={settings.reducedMotion}
                    onChange={(v) => updateSettings({ reducedMotion: v })}
                  />
                  <Toggle
                    label="Compact Mode"
                    description="Smaller UI elements"
                    enabled={settings.compactMode}
                    onChange={(v) => updateSettings({ compactMode: v })}
                  />
                </div>
              </SettingSection>

              {/* Reset Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetSettings}
                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function getStyleDescription(style: string): string {
  switch (style) {
    case "default": return "Classic look"
    case "rounded": return "Soft corners"
    case "glass": return "Frosted glass"
    case "neon": return "Glowing edges"
    default: return ""
  }
}

function SettingSection({ icon, title, description, children }: { icon: React.ReactNode; title: string; description?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 text-white">{icon}</div>
        <div>
          <span className="font-semibold text-white">{title}</span>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  )
}

function StyleButton({ label, description, active, onClick }: { label: string; description?: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 rounded-xl text-left transition-all ${
        active
          ? "bg-white text-black shadow-lg shadow-white/20"
          : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
      }`}
    >
      <span className="font-medium block">{label}</span>
      {description && <span className={`text-xs ${active ? "text-gray-600" : "text-gray-500"}`}>{description}</span>}
    </motion.button>
  )
}

function SpeedButton({ label, active, onClick, speed }: { label: string; active: boolean; onClick: () => void; speed: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
        active
          ? "bg-white text-black shadow-lg"
          : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
      }`}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ 
          duration: speed === "slow" ? 2 : speed === "normal" ? 1 : 0.5, 
          repeat: Infinity 
        }}
        className={`w-2 h-2 rounded-full ${active ? "bg-black" : "bg-white"}`}
      />
      {label}
    </motion.button>
  )
}

function DensityButton({ label, active, onClick, density }: { label: string; active: boolean; onClick: () => void; density: string }) {
  const gap = density === "compact" ? "gap-0.5" : density === "comfortable" ? "gap-1" : "gap-2"
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-2 ${
        active
          ? "bg-white text-black shadow-lg"
          : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
      }`}
    >
      <div className={`flex ${gap}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`w-3 h-4 rounded-sm ${active ? "bg-black/50" : "bg-white/50"}`} />
        ))}
      </div>
      {label}
    </motion.button>
  )
}

function Toggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
      <div>
        <p className="text-white font-medium text-sm">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!enabled)}
        className={`w-14 h-8 rounded-full p-1 transition-all ${
          enabled 
            ? "bg-gradient-to-r from-green-500 to-emerald-600" 
            : "bg-white/10"
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center"
        >
          {enabled && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </motion.svg>
          )}
        </motion.div>
      </motion.button>
    </div>
  )
}
