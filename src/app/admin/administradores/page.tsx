'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus,
  Pencil,
  UserX,
  Users,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'

import { PageHeader } from '@/components/admin/page-header'

import { adminCreateSchema, adminUpdateSchema, type AdminCreateInput, type AdminUpdateInput } from '@/lib/validations'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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

interface AdminUser {
  id: string
  nombre: string
  email: string
  rol: 'SUPERADMIN' | 'ADMIN'
  activo: boolean
  createdAt: string
  updatedAt?: string
}

/* ─── Component ──────────────────────────────────────────────────── */

export default function AdministradoresPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdminId, setCurrentAdminId] = useState<string>('')

  // Create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [updating, setUpdating] = useState(false)

  // Deactivate dialog
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null)
  const [deactivating, setDeactivating] = useState(false)

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admins')
      const json = await res.json()
      if (json.success) {
        setAdmins(json.data)
      } else {
        toast.error('Error al cargar administradores')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCurrentAdmin = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      const json = await res.json()
      if (json.success) setCurrentAdminId(json.data.id)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchAdmins()
    fetchCurrentAdmin()
  }, [fetchAdmins, fetchCurrentAdmin])

  // ─── Create Form ────────────────────────────────────────────────
  const createForm = useForm<AdminCreateInput>({
    resolver: zodResolver(adminCreateSchema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      rol: 'ADMIN',
    },
  })

  async function handleCreate(data: AdminCreateInput) {
    setCreating(true)
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Administrador creado')
        setCreateDialogOpen(false)
        createForm.reset()
        fetchAdmins()
      } else {
        toast.error(json.error || 'Error al crear')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setCreating(false)
    }
  }

  // ─── Edit Form ──────────────────────────────────────────────────
  const editForm = useForm<AdminUpdateInput>({
    resolver: zodResolver(adminUpdateSchema),
  })

  function openEditDialog(admin: AdminUser) {
    setEditingAdmin(admin)
    editForm.reset({
      nombre: admin.nombre,
      email: admin.email,
      rol: admin.rol,
    })
    setEditDialogOpen(true)
  }

  async function handleUpdate(data: AdminUpdateInput) {
    if (!editingAdmin) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admins/${editingAdmin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Administrador actualizado')
        setEditDialogOpen(false)
        fetchAdmins()
      } else {
        toast.error(json.error || 'Error al actualizar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setUpdating(false)
    }
  }

  // ─── Deactivate ─────────────────────────────────────────────────
  async function handleDeactivate() {
    if (!deactivateTarget) return
    setDeactivating(true)
    try {
      const res = await fetch(`/api/admins/${deactivateTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Administrador desactivado')
        setDeactivateTarget(null)
        fetchAdmins()
      } else {
        toast.error(json.error || 'Error al desactivar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Administradores"
        description={`${admins.length} administrador${admins.length !== 1 ? 'es' : ''} registrados`}
      >
        <Button variant="outline" size="sm" onClick={fetchAdmins} disabled={loading}>
          <RefreshCw className={loading ? 'h-4 w-4 mr-1 animate-spin' : 'h-4 w-4 mr-1'} />
          Actualizar
        </Button>
        <Button size="sm" onClick={() => { createForm.reset(); setCreateDialogOpen(true) }} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="h-4 w-4 mr-1" />
          Nuevo Admin
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No hay administradores</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => {
                    const isSelf = admin.id === currentAdminId
                    return (
                      <TableRow key={admin.id} className={!admin.activo ? 'opacity-50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                              admin.rol === 'SUPERADMIN'
                                ? 'bg-violet-100 text-violet-600'
                                : 'bg-gray-100 text-gray-600'
                            )}>
                              {admin.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{admin.nombre}</p>
                              {isSelf && (
                                <p className="text-[10px] text-violet-600">Tú</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {admin.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[11px] font-medium gap-1.5',
                              admin.rol === 'SUPERADMIN'
                                ? 'bg-violet-50 text-violet-700 border-violet-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            )}
                          >
                            <ShieldAlert className={cn('h-3 w-3', admin.rol === 'SUPERADMIN' ? 'text-violet-500' : 'text-slate-500')} />
                            {admin.rol === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            'inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-medium',
                            admin.activo
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          )}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', admin.activo ? 'bg-emerald-500' : 'bg-red-500')} />
                            {admin.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {format(new Date(admin.createdAt), 'dd/MM/yy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(admin)}
                              className="h-8 text-xs"
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Editar
                            </Button>
                            {!isSelf && admin.activo && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeactivateTarget(admin)}
                                className="h-8 text-xs text-destructive hover:text-destructive"
                              >
                                <UserX className="h-3.5 w-3.5 mr-1" />
                                Desactivar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Administrador</DialogTitle>
            <DialogDescription>
              Crea una nueva cuenta de administrador
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ca-nombre">Nombre *</Label>
              <Input id="ca-nombre" {...createForm.register('nombre')} placeholder="Nombre completo" />
              {createForm.formState.errors.nombre && (
                <p className="text-xs text-destructive">{createForm.formState.errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ca-email">Email *</Label>
              <Input id="ca-email" type="email" {...createForm.register('email')} placeholder="admin@ejemplo.com" />
              {createForm.formState.errors.email && (
                <p className="text-xs text-destructive">{createForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ca-pass">Contraseña *</Label>
              <Input id="ca-pass" type="password" {...createForm.register('password')} placeholder="Mínimo 8 caracteres" />
              {createForm.formState.errors.password && (
                <p className="text-xs text-destructive">{createForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={createForm.watch('rol') || 'ADMIN'}
                onValueChange={(v) => createForm.setValue('rol', v as 'SUPERADMIN' | 'ADMIN')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating} className="bg-violet-600 hover:bg-violet-700">
                {creating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Administrador</DialogTitle>
            <DialogDescription>
              Modifica los datos de {editingAdmin?.nombre}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ea-nombre">Nombre</Label>
              <Input id="ea-nombre" {...editForm.register('nombre')} />
              {editForm.formState.errors.nombre && (
                <p className="text-xs text-destructive">{editForm.formState.errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ea-email">Email</Label>
              <Input id="ea-email" type="email" {...editForm.register('email')} />
              {editForm.formState.errors.email && (
                <p className="text-xs text-destructive">{editForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={editForm.watch('rol') || 'ADMIN'}
                onValueChange={(v) => editForm.setValue('rol', v as 'SUPERADMIN' | 'ADMIN')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updating} className="bg-violet-600 hover:bg-violet-700">
                {updating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Actualizar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={(open) => !open && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar administrador?</AlertDialogTitle>
            <AlertDialogDescription>
              Se desactivará la cuenta de &quot;{deactivateTarget?.nombre}&quot;. No podrá iniciar sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={deactivating}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deactivating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
