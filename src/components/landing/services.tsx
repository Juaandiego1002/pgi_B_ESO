'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Eye, Flame, Shield, BookOpen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Service {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  precio: number
  imagenUrl?: string | null
  activo: boolean
  orden: number
}

const categoriaIcons: Record<string, React.ReactNode> = {
  TAROT: <Eye className="w-5 h-5" />,
  AMARRE: <Flame className="w-5 h-5" />,
  LIMPIEZA: <Sparkles className="w-5 h-5" />,
  RITUAL: <Shield className="w-5 h-5" />,
  LECTURA: <BookOpen className="w-5 h-5" />,
  CONSULTA: <Eye className="w-5 h-5" />,
  RETORNO: <Flame className="w-5 h-5" />,
  PROTECCION: <Shield className="w-5 h-5" />,
  PROSPERIDAD: <Sparkles className="w-5 h-5" />,
}

const categoriaColors: Record<string, string> = {
  TAROT: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  AMARRE: 'bg-red-500/20 text-red-300 border-red-500/30',
  LIMPIEZA: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  RITUAL: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  LECTURA: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  CONSULTA: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  RETORNO: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  PROTECCION: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  PROSPERIDAD: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

export function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(res => {
        if (res.success) setServices(res.data)
      })
      .catch(() => toast.error('Error al cargar servicios'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section id="servicios" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  if (services.length === 0) return null

  return (
    <section id="servicios" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold mb-4">
            Nuestros <span className="text-gold-gradient">Servicios</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ofrecemos una amplia gama de servicios esotéricos profesionales para guiar tu camino espiritual.
          </p>
          <div className="section-divider max-w-xs mx-auto mt-6" />
        </motion.div>

        {/* Service cards grid - 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="group h-full bg-card/50 border-border/50 hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5 overflow-hidden">
                <CardContent className="p-6 flex flex-col h-full gap-4">
                  {/* Top row: icon + category badge */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${categoriaColors[service.categoria] || 'bg-accent text-muted-foreground'}`}>
                      {categoriaIcons[service.categoria] || <Sparkles className="w-5 h-5" />}
                    </div>
                    <Badge variant="outline" className="text-xs border-border/50">
                      {service.categoria}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold group-hover:text-gold transition-colors">
                    {service.nombre}
                  </h3>

                  {/* Description (truncated) */}
                  <p className="text-sm text-muted-foreground flex-1 line-clamp-3 leading-relaxed">
                    {service.descripcion}
                  </p>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-xl font-bold text-gold">
                      {formatPrice(service.precio)}
                    </span>
                    <Button
                      size="sm"
                      className="bg-gold hover:bg-gold-light text-mystic-dark"
                      onClick={() => {
                        document.getElementById('consulta')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      Consultar
                    </Button>
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
