'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Testimonial {
  id: string
  nombre: string
  calificacion: number
  comentario: string
  createdAt: string
  servicio?: { id: string; nombre: string } | null
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(res => {
        if (res.success) setTestimonials(res.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section id="testimonios" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) return null

  return (
    <section id="testimonios" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold mb-4">
            Lo que dicen nuestros <span className="text-gold-gradient">Clientes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Historias reales de personas que encontraron guía y paz en nuestros servicios.
          </p>
          <div className="section-divider max-w-xs mx-auto mt-6" />
        </motion.div>

        {/* Testimonial cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full bg-card/50 border-gold/20 hover:border-gold/40 transition-all duration-300 relative overflow-hidden">
                <CardContent className="p-6 flex flex-col h-full gap-4">
                  {/* Quote icon */}
                  <div className="flex justify-between items-start">
                    <Quote className="w-6 h-6 text-gold/30" />
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className={`w-4 h-4 ${
                            j < t.calificacion
                              ? 'text-gold fill-gold'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-muted-foreground italic leading-relaxed flex-1">
                    &ldquo;{t.comentario}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm shrink-0">
                      {t.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium">{t.nombre}</span>
                      {t.servicio && (
                        <p className="text-xs text-muted-foreground">{t.servicio.nombre}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
