"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"

const backgrounds = [
  "/assets/BG LOGIN 1.jpg",
  "/assets/BG LOGIN 2.jpg",
]

export default function BackgroundSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgrounds.length)
    }, 5000) // Ganti gambar setiap 5 detik

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={backgrounds[currentIndex]}
            alt={`Background ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px]" />
    </div>
  )
}
