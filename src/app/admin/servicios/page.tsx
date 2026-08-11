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
  Loader2,
  Package,
  RefreshCw,
} from 'lucide-react'

import { serviceCreateSchema, type ServiceCreateInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Skeleton } from '@/components/ui/skeleton'

/* ─── Types ──────────────────────────────────────────────────────── */

interface Service {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  precio: number
  imagenUrl: string | null
  activo: boolean
  orden: number
  createdAt: string
  updatedAt: string
  _count?: { inquiries: number; testimonials: number }
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/* ─── Component ──────────────────────────────────────────────────── */

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Toggle loading
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/services?all=true')
      const json = await res.json()
      if (json.success) {
        setServices(json.data)
      } else {
        toast.error('Error al cargar servicios')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const form = useForm<ServiceCreateInput>({
    resolver: zodResolver(serviceCreateSchema) as Resolver<ServiceCreateInput>,
    defaultValues: {
      nombre: '',
      descripcion: '',
      categoria: '',
      precio: 0,
      imagenUrl: '',
      activo: true,
      orden: 0,
    },
  })

  function openCreateDialog() {
    setEditingService(null)
    form.reset({
      nombre: '',
      descripcion: '',
      categoria: '',
      precio: 0,
      imagenUrl: '',
      activo: true,
      orden: services.length,
    })
    setDialogOpen(true)
  }

  function openEditDialog(service: Service) {
    setEditingService(service)
    form.reset({
      nombre: service.nombre,
      descripcion: service.descripcion,
      categoria: service.categoria,
      precio: service.precio,
      imagenUrl: service.imagenUrl || '',
      activo: service.activo,
      orden: service.orden,
    })
    setDialogOpen(true)
  }

  async function handleSave(data: ServiceCreateInput) {
    setSaving(true)
    try {
      const isEditing = !!editingService
      const url = isEditing ? `/api/services/${editingService.id}` : '/api/services'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (json.success) {
        toast.success(isEditing ? 'Servicio actualizado' : 'Servicio creado')
        setDialogOpen(false)
        fetchServices()
      } else {
        toast.error(json.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActivo(service: Service) {
    setTogglingId(service.id)
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !service.activo }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(service.activo ? 'Servicio desactivado' : 'Servicio activado')
        fetchServices()
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
      const res = await fetch(`/api/services/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Servicio eliminado')
        setDeleteTarget(null)
        fetchServices()
      } else {
        toast.error(json.error || 'Error al eliminar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setDeleting(false)
    }
  }

  async function handleOrdenChange(serviceId: string, newOrden: number) {
    try {
      await fetch(`/api/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orden: newOrden }),
      })
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="Servicios"
        description={`${services.length} servicio${services.length !== 1 ? 's' : ''} en el catálogo`}
      >
        <Button variant="outline" size="sm" onClick={fetchServices} disabled={loading}>
          <RefreshCw className={loading ? 'h-4 w-4 mr-1 animate-spin' : 'h-4 w-4 mr-1'} />
          Actualizar
        </Button>
        <Button size="sm" onClick={openCreateDialog} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="h-4 w-4 mr-1" />
          Nuevo Servicio
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
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No hay servicios</p>
              <Button variant="link" size="sm" onClick={openCreateDialog} className="mt-2">
                Crear el primero
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Orden</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Categoría</TableHead>
                    <TableHead className="hidden sm:table-cell">Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden lg:table-cell">Consultas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id} className={!service.activo ? 'opacity-60' : ''}>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={service.orden}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0
                            setServices((prev) =>
                              prev.map((s) => (s.id === service.id ? { ...s, orden: val } : s))
                            )
                            handleOrdenChange(service.id, val)
                          }}
                          className="h-8 w-16 text-center text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {service.imagenUrl && (
                            <img
                              src={service.imagenUrl}
                              alt=""
                              className="h-8 w-8 rounded object-cover bg-muted"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm">{service.nombre}</p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                              {service.descripcion.slice(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="text-[10px]">
                          {service.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm font-medium">
                        {formatCOP(service.precio)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={service.activo}
                            onCheckedChange={() => handleToggleActivo(service)}
                            disabled={togglingId === service.id}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {service._count?.inquiries || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(service)}
                            className="h-8 text-xs"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(service)}
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
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </DialogTitle>
            <DialogDescription>
              {editingService ? 'Modifica los datos del servicio' : 'Completa los datos del nuevo servicio'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="svc-nombre">Nombre *</Label>
              <Input id="svc-nombre" {...form.register('nombre')} placeholder="Ej: Amarre de amor" />
              {form.formState.errors.nombre && (
                <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-desc">Descripción *</Label>
              <Textarea id="svc-desc" {...form.register('descripcion')} placeholder="Describe el servicio..." rows={3} />
              {form.formState.errors.descripcion && (
                <p className="text-xs text-destructive">{form.formState.errors.descripcion.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="svc-cat">Categoría *</Label>
                <Input id="svc-cat" {...form.register('categoria')} placeholder="Ej: Amarres" />
                {form.formState.errors.categoria && (
                  <p className="text-xs text-destructive">{form.formState.errors.categoria.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-precio">Precio (COP) *</Label>
                <Input id="svc-precio" type="number" min={0} {...form.register('precio')} />
                {form.formState.errors.precio && (
                  <p className="text-xs text-destructive">{form.formState.errors.precio.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="svc-img">URL Imagen</Label>
                <Input id="svc-img" {...form.register('imagenUrl')} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-orden">Orden</Label>
                <Input id="svc-orden" type="number" min={0} {...form.register('orden')} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                {editingService ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el servicio &quot;{deleteTarget?.nombre}&quot;. No se puede deshacer.
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
