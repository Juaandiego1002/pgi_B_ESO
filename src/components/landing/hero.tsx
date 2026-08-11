'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronDown } from 'lucide-react'

function MoonSVG() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      className="text-gold/20 animate-drift"
    >
      <path
        d="M40 8C28 8 18 18 18 30C18 42 28 52 40 52C42 52 44 51.8 46 51.4C38 48 32 40 32 30C32 20 38 12 46 8.6C44 8.2 42 8 40 8Z"
        fill="currentColor"
      />
    </svg>
  )
}

function StarDecor({ className = '', size = 16, delay = 0 }: { className?: string; size?: number; delay?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-gold/40 animate-sparkle ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <path d="M12 2L14.1 8.5L20 9.5L15.5 14L17 20L12 17L7 20L8.5 14L4 9.5L9.9 8.5L12 2Z" />
    </svg>
  )
}

function SparkleDot({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div
      className={`w-1.5 h-1.5 rounded-full bg-gold/60 animate-twinkle ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  )
}

export function Hero() {
  const handleCTA = () => {
    document.getElementById('consulta')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Stars particle layer */}
      <div className="absolute inset-0 stars-bg" />

      {/* Decorative moon - top right */}
      <motion.div
        initial={{ opacity: 0, x: 40, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute top-20 right-8 md:right-20 lg:right-32"
      >
        <MoonSVG />
      </motion.div>

      {/* Decorative stars scattered */}
      <StarDecor className="absolute top-16 left-[10%]" size={14} delay={0} />
      <StarDecor className="absolute top-32 left-[25%]" size={10} delay={1.2} />
      <StarDecor className="absolute top-24 right-[15%]" size={12} delay={0.8} />
      <StarDecor className="absolute bottom-32 left-[8%]" size={18} delay={0.4} />
      <StarDecor className="absolute bottom-48 right-[12%]" size={10} delay={2} />
      <StarDecor className="absolute top-1/3 left-[5%] hidden md:block" size={16} delay={1.6} />
      <StarDecor className="absolute top-1/4 right-[30%] hidden md:block" size={12} delay={2.4} />

      {/* Sparkle dots */}
      <SparkleDot className="absolute top-20 left-[35%]" delay={0.5} />
      <SparkleDot className="absolute top-40 left-[50%]" delay={1.8} />
      <SparkleDot className="absolute top-60 right-[25%]" delay={0.3} />
      <SparkleDot className="absolute bottom-40 left-[40%]" delay={2.2} />
      <SparkleDot className="absolute bottom-60 right-[40%]" delay={1.1} />
      <SparkleDot className="absolute top-1/2 left-[18%] hidden sm:block" delay={2.8} />
      <SparkleDot className="absolute top-1/3 right-[8%] hidden sm:block" delay={0.7} />

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm">
              <Sparkles className="w-4 h-4" />
              Servicios Esotéricos Profesionales
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight gold-glow"
          >
            <span className="text-gold-gradient">Retornos y Amarres</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Guía espiritual profesional para el amor, la protección y la prosperidad
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-2"
          >
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-light text-mystic-dark font-semibold text-lg px-8 py-6 animate-pulse-gold"
              onClick={handleCTA}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Solicita tu Consulta Ahora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gold/50 text-gold hover:bg-gold/10 text-lg px-8 py-6"
              onClick={() => {
                document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Ver Servicios
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll down indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-8 h-8 text-gold/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
