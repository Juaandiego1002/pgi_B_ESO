'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Phone, Sparkles } from 'lucide-react'

const steps = [
  {
    icon: <MessageCircle className="w-7 h-7" />,
    title: 'Cuéntanos tu situación',
    description: 'Completa el formulario de consulta con los detalles de tu caso. Toda la información es confidencial.',
    step: 1,
  },
  {
    icon: <Phone className="w-7 h-7" />,
    title: 'Te contactamos',
    description: 'Nuestro equipo revisa tu solicitud y se comunica contigo por WhatsApp para entender mejor tu necesidad.',
    step: 2,
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: 'Realizamos el trabajo',
    description: 'Ejecutamos el trabajo espiritual con dedicación total. Te acompañamos y orientamos durante todo el proceso.',
    step: 3,
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 px-4 bg-accent/20">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold mb-4">
            Cómo <span className="text-gold-gradient">Funciona</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Un proceso sencillo y confidencial para recibir la guía espiritual que necesitas.
          </p>
          <div className="section-divider max-w-xs mx-auto mt-6" />
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-20 left-[15%] right-[15%] h-px">
            <div className="h-full bg-gradient-to-r from-gold/10 via-gold/30 to-gold/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="relative text-center group"
              >
                {/* Step number + icon */}
                <div className="relative inline-flex flex-col items-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 text-gold mb-5 group-hover:bg-gold/20 transition-all duration-300 group-hover:scale-105">
                    {step.icon}
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gold text-mystic-dark flex items-center justify-center text-xs font-bold">
                    {step.step}
                  </div>
                </div>

                {/* Decorative dots between steps (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center mt-8">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-gold/30" />
                      <div className="w-1 h-1 rounded-full bg-gold/20" />
                      <div className="w-1 h-1 rounded-full bg-gold/10" />
                    </div>
                  </div>
                )}

                <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold mb-3 group-hover:text-gold transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-14"
        >
          <button
            onClick={() => {
              document.getElementById('consulta')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium"
          >
            Comienza ahora — es gratis y confidencial
            <Sparkles className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
