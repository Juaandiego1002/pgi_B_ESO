'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Send, Mail, Phone, MapPin, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { contactMessageSchema, type ContactMessageInput } from '@/lib/validations'
import { useState } from 'react'

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      mensaje: '',
    },
  })

  const onSubmit = async (data: ContactMessageInput) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        telefono: data.telefono || undefined,
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (result.success) {
        toast.success('¡Mensaje enviado! Te contactaremos pronto.')
        setSubmitted(true)
        form.reset()
      } else {
        toast.error(result.error || 'Error al enviar mensaje')
      }
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contacto" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold mb-4">
            Contáctanos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ¿Tienes dudas? Escríbenos y con gusto te orientaremos.
          </p>
          <div className="section-divider max-w-xs mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {submitted ? (
              <Card className="border-green-500/30 bg-card/60">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold mb-2">
                    ¡Mensaje Enviado!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Hemos recibido tu mensaje y te responderemos pronto.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                    className="border-gold/50 text-gold hover:bg-gold/10"
                  >
                    Enviar otro mensaje
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gold/20 bg-card/60">
                <CardContent className="p-6 sm:p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Tu nombre"
                                className="bg-background/50 border-border/50 focus-visible:border-gold/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="tu@email.com"
                                  className="bg-background/50 border-border/50 focus-visible:border-gold/50"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="telefono"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+57 300 000 0000"
                                  className="bg-background/50 border-border/50 focus-visible:border-gold/50"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="mensaje"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensaje *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Cuéntanos en qué podemos ayudarte..."
                                className="bg-background/50 border-border/50 focus-visible:border-gold/50 min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gold hover:bg-gold-light text-mystic-dark font-semibold"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Mensaje
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 flex flex-col justify-center"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gold/10 text-gold shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">WhatsApp / Teléfono</h4>
                  <p className="text-sm text-muted-foreground">+57 300 123 4567</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gold/10 text-gold shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <p className="text-sm text-muted-foreground">contacto@retornosyamarres.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gold/10 text-gold shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Ubicación</h4>
                  <p className="text-sm text-muted-foreground">Bogotá, Colombia</p>
                </div>
              </div>
            </div>

            <Card className="border-gold/20 bg-card/40">
              <CardContent className="p-6">
                <h4 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-gold mb-2">
                  ¿Necesitas orientación urgente?
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Estamos disponibles para consultas y citas. Tu caso es tratado con total privacidad y profesionalismo.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
