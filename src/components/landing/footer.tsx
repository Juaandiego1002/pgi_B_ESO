'use client'

import { Star, Instagram, Facebook, MessageCircle, Heart } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="text-sm text-muted-foreground hover:text-gold transition-colors"
    >
      {label}
    </a>
  )
}

export function LandingFooter() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="mt-auto border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-gold" />
              <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-gold-gradient">
                Retornos y Amarres
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Guía espiritual profesional con más de 15 años de experiencia. 
              Tu bienestar espiritual es nuestra prioridad.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="p-2.5 rounded-lg bg-accent hover:bg-gold/20 transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-lg bg-accent hover:bg-gold/20 transition-colors group"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-lg bg-accent hover:bg-gold/20 transition-colors group"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Servicios</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => scrollToSection('servicios')}
                className="text-sm text-muted-foreground hover:text-gold transition-colors text-left"
              >
                Retorno de Pareja
              </button>
              <button
                onClick={() => scrollToSection('servicios')}
                className="text-sm text-muted-foreground hover:text-gold transition-colors text-left"
              >
                Amarres de Amor
              </button>
              <button
                onClick={() => scrollToSection('servicios')}
                className="text-sm text-muted-foreground hover:text-gold transition-colors text-left"
              >
                Lecturas de Tarot
              </button>
              <button
                onClick={() => scrollToSection('servicios')}
                className="text-sm text-muted-foreground hover:text-gold transition-colors text-left"
              >
                Limpieza Energética
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Enlaces</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => scrollToSection('testimonios')}
                className="text-sm text-muted-foreground hover:text-gold transition-colors text-left"
              >
                Testimonios
              </button>
              <button
                onClick={() => scrollToSection('contacto')}
                className="text-sm text-muted-foreground hover:text-gold transition-colors text-left"
              >
                Contacto
              </button>
              <button
                onClick={() => scrollToSection('como-funciona')}
                className="text-sm text-muted-foreground hover:text-gold transition-colors text-left"
              >
                Cómo Funciona
              </button>
              <FooterLink href="#" label="Política de Privacidad" />
            </div>
          </div>

          {/* CTA / Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">¿Listo para empezar?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Solicita tu consulta ahora. Sin compromiso, totalmente confidencial.
            </p>
            <button
              onClick={() => scrollToSection('consulta')}
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-mystic-dark font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              <Heart className="w-4 h-4" />
              Solicitar Consulta
            </button>
          </div>
        </div>

        <Separator className="my-8 bg-border/50" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Retornos y Amarres. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con <Heart className="w-3 h-3 text-gold fill-gold" /> en Colombia
          </p>
        </div>
      </div>
    </footer>
  )
}
