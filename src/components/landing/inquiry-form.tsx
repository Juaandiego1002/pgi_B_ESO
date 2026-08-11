'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Send, CheckCircle2, Loader2, Sparkles, Shield, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { inquiryCreateSchema, type InquiryCreateInput } from '@/lib/validations'

interface ServiceOption {
  id: string
  nombre: string
  precio: number
}

export function InquiryForm() {
  const [services, setServices] = useState<ServiceOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<InquiryCreateInput>({
    resolver: zodResolver(inquiryCreateSchema),
    defaultValues: {
      nombreCliente: '',
      telefono: '',
      email: '',
      servicioInteresId: '',
      motivoConsulta: '',
    } as InquiryCreateInput,
  })

  // Fetch services for the select dropdown
  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setServices(
            res.data.map((s: { id: string; nombre: string; precio: number }) => ({
              id: s.id,
              nombre: s.nombre,
              precio: s.precio,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const onSubmit = async (data: InquiryCreateInput) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        email: data.email || undefined,
        servicioInteresId: data.servicioInteresId && data.servicioInteresId !== '__none__' ? data.servicioInteresId : undefined,
      }

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (result.success) {
        toast.success('¡Solicitud enviada con éxito!')
        setSubmitted(true)
        form.reset()
      } else {
        toast.error(result.error || 'Error al enviar la solicitud')
      }
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section id="consulta" className="py-20 px-4 bg-accent/20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold mb-4 text-gold-gradient">
              ¡Solicitud Recibida!
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              ¡Hemos recibido tu solicitud! Nos pondremos en contacto pronto por WhatsApp.
            </p>
            <Button
              onClick={() => {
                setSubmitted(false)
                form.reset({
                  nombreCliente: '',
                  telefono: '',
                  email: '',
                  servicioInteresId: '',
                  motivoConsulta: '',
                })
              }}
              variant="outline"
              className="border-gold/50 text-gold hover:bg-gold/10"
            >
              Enviar otra consulta
            </Button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="consulta" className="py-20 px-4 bg-accent/20">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold mb-4">
            Solicita tu <span className="text-gold-gradient">Consulta</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cuéntanos tu situación y te guiaremos. Es rápido, confidencial y sin compromiso.
          </p>
          <div className="section-divider max-w-xs mx-auto mt-6" />
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-8"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-gold" />
            100% Confidencial
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-4 h-4 text-gold" />
            Atención Personalizada
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="w-4 h-4 text-gold" />
            Sin Registro
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-gold/20 bg-card/60">
            <CardContent className="p-6 sm:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name + Phone row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nombreCliente"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Nombre *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tu nombre completo"
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
                          <FormLabel className="text-foreground">Teléfono / WhatsApp *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
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

                  {/* Email + Service row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Email <span className="text-muted-foreground text-xs">(opcional)</span>
                          </FormLabel>
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
                      name="servicioInteresId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Servicio de interés <span className="text-muted-foreground text-xs">(opcional)</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full bg-background/50 border-border/50 focus:ring-gold/20">
                                <SelectValue placeholder="Selecciona un servicio (opcional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="__none__">No estoy seguro</SelectItem>
                              {services.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Motivo de consulta */}
                  <FormField
                    control={form.control}
                    name="motivoConsulta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Cuéntanos tu situación *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe detalladamente tu situación o lo que necesitas... (mínimo 20 caracteres)"
                            className="bg-background/50 border-border/50 focus-visible:border-gold/50 min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit button */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gold hover:bg-gold-light text-mystic-dark font-semibold text-base py-6 transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Solicitud
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Al enviar, aceptas ser contactado por WhatsApp. Tu información es confidencial.
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
