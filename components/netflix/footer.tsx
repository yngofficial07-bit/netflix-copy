"use client"

import { motion } from "framer-motion"
import { Facebook, Instagram, Twitter, Youtube, Globe, ChevronDown } from "lucide-react"
import { useSettings, accentColors } from "./settings-context"

const footerLinks = [
  { title: "About", links: ["Audio Description", "Help Center", "Gift Cards", "Media Center", "Investor Relations"] },
  { title: "Legal", links: ["Terms of Use", "Privacy", "Legal Notices", "Cookie Preferences"] },
  { title: "Contact", links: ["Corporate Information", "Contact Us", "Jobs", "Redeem Gift Cards"] },
  { title: "Account", links: ["Account Settings", "Manage Profiles", "Ways to Watch", "Speed Test"] },
]

export function Footer() {
  const { settings } = useSettings()
  const accentColor = accentColors[settings.accentColor].primary

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative px-4 md:px-8 lg:px-12 py-12 md:py-16 mt-8 bg-gradient-to-b from-transparent via-black/50 to-black"
    >
      {/* Gradient Top Border */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)` }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Top Section - Social & Language */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-12">
          {/* Social Links */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 md:gap-6"
          >
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={settings.reducedMotion ? {} : { scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <Icon className="h-5 w-5" />
              </motion.a>
            ))}
          </motion.div>

          {/* Language Selector */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-700 bg-black/50 text-gray-300 hover:border-gray-500 transition-all"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm">English</span>
            <ChevronDown className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
          {footerLinks.map((section, sectionIndex) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm">{section.title}</h4>
              <div className="space-y-2 md:space-y-3">
                {section.links.map((link, i) => (
                  <motion.a
                    key={link}
                    href="#"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (sectionIndex * 5 + i) * 0.02 }}
                    whileHover={settings.reducedMotion ? {} : { x: 3 }}
                    className="block text-xs md:text-sm text-gray-500 hover:text-white transition-all"
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Service Code Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-xs md:text-sm text-gray-500 border border-gray-700 px-3 py-1.5 rounded hover:text-gray-300 hover:border-gray-500 transition-all mb-6"
        >
          Service Code
        </motion.button>

        {/* Bottom Section - Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 md:pt-8 border-t border-gray-800/50"
        >
          <p className="text-[10px] md:text-xs text-gray-600">
            © 2024 Netflix Clone. For demonstration purposes only. This is not affiliated with Netflix Inc.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] md:text-xs text-gray-600">Made with</span>
            <motion.span
              animate={settings.reducedMotion ? {} : { scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ color: accentColor }}
            >
              ♥
            </motion.span>
            <span className="text-[10px] md:text-xs text-gray-600">by v0</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}
