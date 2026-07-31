"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, ChevronDown, Sparkles, Menu, X, Home, Tv, Film, TrendingUp, Heart, Globe, User, Settings, HelpCircle, LogOut } from "lucide-react"
import Image from "next/image"
import { useSettings, accentColors } from "./settings-context"

const notifications = [
  { id: 1, title: "New Season: Stranger Things S5", time: "2 hours ago", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&q=80" },
  { id: 2, title: "Continue Watching: The Crown", time: "5 hours ago", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&q=80" },
  { id: 3, title: "New Movie: Oppenheimer", time: "1 day ago", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=100&q=80" },
]

type Tab = "home" | "tvshows" | "movies" | "mylist" | "language"

const navLinks: { label: string; tab: Tab; icon: any }[] = [
  { label: "Home",                tab: "home",     icon: Home },
  { label: "TV Shows",            tab: "tvshows",  icon: Tv },
  { label: "Movies",              tab: "movies",   icon: Film },
  { label: "My List",             tab: "mylist",   icon: Heart },
  { label: "Browse by Language",  tab: "language", icon: Globe },
]

interface NavbarProps {
  onSearch?: (query: string) => void
  activeTab?: Tab
  onTabChange?: (tab: Tab) => void
}

export function Navbar({ onSearch, activeTab = "home", onTabChange }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const { settings, setIsSettingsOpen } = useSettings()
  const accentColor = accentColors[settings.accentColor].primary
  const glowColor = accentColors[settings.accentColor].glow

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [showMobileMenu])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  const handleSearchToggle = () => {
    setShowSearch(s => !s)
    if (!showSearch) setTimeout(() => searchRef.current?.focus(), 100)
  }

  const handleTabClick = (tab: Tab) => {
    onTabChange?.(tab)
    setShowMobileMenu(false)
    // Clear search when switching tabs
    if (searchQuery) { setSearchQuery(""); onSearch?.("") }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/95 backdrop-blur-xl shadow-2xl shadow-black/50"
            : "bg-gradient-to-b from-black/90 via-black/50 to-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 py-3 md:py-4">
          {/* Left */}
          <div className="flex items-center gap-4 md:gap-8 lg:gap-10">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="h-6 w-6 text-white" />
            </motion.button>

            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="cursor-pointer flex-shrink-0"
              onClick={() => handleTabClick("home")}
            >
              <span
                className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight select-none"
                style={{ color: accentColor }}
              >
                AURAFLIX
              </span>
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-6">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.tab}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleTabClick(link.tab)}
                  className={`text-sm font-medium transition-all duration-300 relative group whitespace-nowrap ${
                    activeTab === link.tab ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                  {activeTab === link.tab && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  )}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: accentColor, opacity: activeTab === link.tab ? 0 : 1 }} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search */}
            <motion.div className="relative flex items-center" layout>
              <AnimatePresence mode="wait">
                {showSearch && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute right-10 overflow-hidden"
                    style={{ maxWidth: 280 }}
                  >
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Titles, people, genres"
                      className="w-full bg-black/90 backdrop-blur-md border border-white/30 rounded-md text-sm px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-white/60 transition-colors"
                      onKeyDown={(e) => e.key === "Escape" && setShowSearch(false)}
                      onBlur={() => { if (!searchQuery) setShowSearch(false) }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={handleSearchToggle}
                className="p-2.5 rounded-full hover:bg-white/10 transition-colors relative z-10"
              >
                <Search className="h-5 w-5 text-white" />
              </motion.button>
            </motion.div>

            {/* Notifications */}
            <div className="relative hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
                className="relative p-2.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <Bell className="h-5 w-5 text-white" />
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-1 right-1 h-4 w-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${glowColor}` }}
                >3</motion.span>
              </motion.button>
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                    >
                      <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-bold text-white">Notifications</h3>
                        <span className="text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">Mark all as read</span>
                      </div>
                      {notifications.map((notif, i) => (
                        <motion.div key={notif.id}
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
                        >
                          <div className="flex gap-3">
                            <div className="relative w-20 h-12 rounded-md overflow-hidden flex-shrink-0">
                              <Image src={notif.image} alt="" fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium truncate">{notif.title}</p>
                              <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div className="p-3 border-t border-white/10">
                        <button className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors">View all notifications</button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Customize */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-full hover:bg-white/10 transition-colors hidden md:flex"
              style={{ color: accentColor }}
            >
              <Sparkles className="h-5 w-5" />
            </motion.button>

            {/* Profile */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
                className="flex items-center gap-1.5 cursor-pointer group"
              >
                <div className="h-8 w-8 rounded-md overflow-hidden ring-2 ring-transparent group-hover:ring-white/50 transition-all"
                  style={{ boxShadow: `0 0 0 2px ${accentColor}20` }}>
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" alt="Profile" width={32} height={32} className="object-cover" />
                </div>
                <motion.div animate={{ rotate: showProfile ? 180 : 0 }} className="hidden sm:block">
                  <ChevronDown className="h-4 w-4 text-white" />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {showProfile && (
                  <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                    >
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <Image src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" alt="Profile" width={48} height={48} className="rounded-md" />
                          <div>
                            <p className="font-semibold text-white">AuraFlix User</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                              Premium Plan
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        {[{ icon: User, label: "Manage Profiles" }, { icon: Settings, label: "Account Settings" }, { icon: HelpCircle, label: "Help Center" }].map(item => (
                          <button key={item.label} className="w-full px-4 py-3 text-sm text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3">
                            <item.icon className="h-4 w-4" />{item.label}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-white/10 py-2">
                        <button className="w-full px-4 py-3 text-sm text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3">
                          <LogOut className="h-4 w-4" />Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setShowMobileMenu(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] sm:w-[320px] bg-black/95 backdrop-blur-xl border-r border-white/10 z-[70] lg:hidden overflow-y-auto"
            >
              <div className="sticky top-0 bg-black/95 backdrop-blur-xl p-4 border-b border-white/10 flex items-center justify-between">
                <svg viewBox="0 0 111 30" className="h-7" style={{ fill: accentColor }}>
                  <path d="M105.062 14.28L111 30c-1.75-.25-3.499-.563-5.28-.845l-3.345-8.686-3.437 7.969c-1.687-.282-3.344-.376-5.031-.595l6.031-13.75L94.468 0h5.063l3.062 7.874L105.875 0h5.124l-5.937 14.28zM90.47 0h-4.594v27.25c1.5.094 3.062.156 4.594.343V0zm-8.563 26.937c-4.187-.281-8.375-.53-12.656-.625V0h4.687v21.875c2.688.062 5.375.28 7.969.405v4.657zM64.25 10.657v4.687h-6.406V26H53.22V0h13.125v4.687h-8.5v5.97h6.406zm-18.906-5.97V26.25c-1.563 0-3.156 0-4.688.062V4.687h-4.844V0h14.406v4.687h-4.874zM30.75 0v21.875c2.75.156 5.5.406 8.281.5v4.5L26.125 26V0H30.75zm-12.031 0v27.5c-1.563.031-3.125.125-4.688.25V0h4.688zm-8.75 0v28.125c-1.575.156-3.156.313-4.688.531V0h4.688zM.001 0v30L4.688 29.5V0H.001z" />
                </svg>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowMobileMenu(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="h-6 w-6 text-white" />
                </motion.button>
              </div>

              {/* Search in mobile */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search titles..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg text-sm px-4 py-2.5 pl-9 text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div className="py-4">
                {navLinks.map((link, i) => (
                  <motion.button key={link.tab}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleTabClick(link.tab)}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors w-full ${
                      activeTab === link.tab ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                    style={activeTab === link.tab ? { borderLeft: `3px solid ${accentColor}` } : {}}
                  >
                    <link.icon className="h-5 w-5" /><span className="font-medium">{link.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="border-t border-white/10 py-4">
                <button onClick={() => { setShowMobileMenu(false); setIsSettingsOpen(true) }}
                  className="flex items-center gap-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/5 transition-colors w-full">
                  <Sparkles className="h-5 w-5" style={{ color: accentColor }} />
                  <span className="font-medium">Customize Theme</span>
                </button>
                <button className="flex items-center gap-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/5 transition-colors w-full">
                  <Bell className="h-5 w-5" /><span className="font-medium">Notifications</span>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: accentColor }}>3</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
