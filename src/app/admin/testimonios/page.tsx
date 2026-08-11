'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Loader2,
  RefreshCw,
} from 'lucide-react'

import { testimonialCreateSchema, type TestimonialCreateInput } from '@/lib/validations'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { PageHeader } from '@/components/admin/page-header'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

/* ─── Types ──────────────────────────────────────────────────────── */

interface Service {
  id: string
  nombre: string
}

interface Testimonial {
  id: string
  nombre: string
  servicioId: string | null
  calificacion: number
  comentario: string
  aprobado: boolean
  createdAt: string
  servicio?: { id: string; nombre: string } | null
}

/* ─── Component ──────────────────────────────────────────────────── */

export default function TestimoniosPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Toggle loading
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchTestimonials = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/testimonials?all=true')
      const json = await res.json()
      if (json.success) {
        setTestimonials(json.data)
      } else {
        toast.error('Error al cargar testimonios')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services')
      const json = await res.json()
      if (json.success) setServices(json.data)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchTestimonials()
    fetchServices()
  }, [fetchTestimonials, fetchServices])

  const form = useForm<TestimonialCreateInput>({
    resolver: zodResolver(testimonialCreateSchema) as Resolver<TestimonialCreateInput>,
    defaultValues: {
      nombre: '',
      servicioId: '',
      calificacion: 5,
      comentario: '',
      aprobado: true,
    },
  })

  function openCreateDialog() {
    setEditingTestimonial(null)
    form.reset({
      nombre: '',
      servicioId: '',
      calificacion: 5,
      comentario: '',
      aprobado: true,
    })
    setDialogOpen(true)
  }

  function openEditDialog(t: Testimonial) {
    setEditingTestimonial(t)
    form.reset({
      nombre: t.nombre,
      servicioId: t.servicioId || '',
      calificacion: t.calificacion,
      comentario: t.comentario,
      aprobado: t.aprobado,
    })
    setDialogOpen(true)
  }

  async function handleSave(data: TestimonialCreateInput) {
    setSaving(true)
    try {
      const isEditing = !!editingTestimonial
      const url = isEditing ? `/api/testimonials/${editingTestimonial.id}` : '/api/testimonials'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (json.success) {
        toast.success(isEditing ? 'Testimonio actualizado' : 'Testimonio creado')
        setDialogOpen(false)
        fetchTestimonials()
      } else {
        toast.error(json.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleAprobado(t: Testimonial) {
    setTogglingId(t.id)
    try {
      const res = await fetch(`/api/testimonials/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprobado: !t.aprobado }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(t.aprobado ? 'Testimonio ocultado' : 'Testimonio aprobado')
        fetchTestimonials()
      } else {
        toast.error(json.error || 'Error al actualizar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/testimonials/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Testimonio eliminado')
        setDeleteTarget(null)
        fetchTestimonials()
      } else {
        toast.error(json.error || 'Error al eliminar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Star}
        title="Testimonios"
        description={`${testimonials.length} testimonio${testimonials.length !== 1 ? 's' : ''} registrados`}
      >
        <Button variant="outline" size="sm" onClick={fetchTestimonials} disabled={loading}>
          <RefreshCw className={loading ? 'h-4 w-4 mr-1 animate-spin' : 'h-4 w-4 mr-1'} />
          Actualizar
        </Button>
        <Button size="sm" onClick={openCreateDialog} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="h-4 w-4 mr-1" />
          Nuevo Testimonio
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Star className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No hay testimonios</p>
              <Button variant="link" size="sm" onClick={openCreateDialog} className="mt-2">
                Crear el primero
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden sm:table-cell">Servicio</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((t) => (
                    <TableRow key={t.id} className={!t.aprobado ? 'opacity-60' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{t.nombre}</p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {t.comentario.slice(0, 60)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {t.servicio?.nombre || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-3.5 w-3.5',
                                i < t.calificacion
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/30'
                              )}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={t.aprobado}
                          onCheckedChange={() => handleToggleAprobado(t)}
                          disabled={togglingId === t.id}
                        />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {format(new Date(t.createdAt), 'dd/MM/yy', { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(t)}
                            className="h-8 text-xs"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(t)}
                            className="h-8 text-xs text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Editar Testimonio' : 'Nuevo Testimonio'}
            </DialogTitle>
            <DialogDescription>
              {editingTestimonial ? 'Modifica los datos del testimonio' : 'Completa los datos del nuevo testimonio'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tst-nombre">Nombre *</Label>
              <Input id="tst-nombre" {...form.register('nombre')} placeholder="Nombre del cliente" />
              {form.formState.errors.nombre && (
                <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Servicio</Label>
              <Select
                value={form.watch('servicioId') || ''}
                onValueChange={(v) => form.setValue('servicioId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin servicio</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tst-calif">Calificación</Label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => form.setValue('calificacion', i + 1)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        'h-6 w-6 transition-colors',
                        i < form.watch('calificacion')
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30 hover:text-amber-400'
                      )}
                    />
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {form.watch('calificacion')} / 5
                </span>
              </div>
              {form.formState.errors.calificacion && (
                <p className="text-xs text-destructive">{form.formState.errors.calificacion.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tst-coment">Comentario *</Label>
              <Textarea
                id="tst-coment"
                {...form.register('comentario')}
                placeholder="Escribe el testimonio..."
                rows={4}
              />
              {form.formState.errors.comentario && (
                <p className="text-xs text-destructive">{form.formState.errors.comentario.message}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.watch('aprobado')}
                onCheckedChange={(v) => form.setValue('aprobado', v)}
              />
              <Label className="text-sm">Aprobado (visible públicamente)</Label>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                {editingTestimonial ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar testimonio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el testimonio de &quot;{deleteTarget?.nombre}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
