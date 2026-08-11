'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Search,
  Download,
  Eye,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Inbox,
  User,
  CalendarDays,
  Tag,
  Mail,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/admin/page-header'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

/* ─── Types ──────────────────────────────────────────────────────── */

interface Inquiry {
  id: string
  nombreCliente: string
  telefono: string
  email: string | null
  servicioInteresId: string | null
  motivoConsulta: string
  estado: string
  notasInternas: string | null
  origen: string
  createdAt: string
  updatedAt: string
  servicioInteres?: { id: string; nombre: string } | null
}

interface Service {
  id: string
  nombre: string
}

/* ─── Status Config ──────────────────────────────────────────────── */

const STATUS_OPTIONS = [
  'NUEVO',
  'CONTACTADO',
  'EN_NEGOCIACION',
  'CONFIRMADO',
  'COMPLETADO',
  'DESCARTADO',
] as const

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  NUEVO: { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  CONTACTADO: { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  EN_NEGOCIACION: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  CONFIRMADO: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  COMPLETADO: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600' },
  DESCARTADO: { badge: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
}

const STATUS_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo',
  CONTACTADO: 'Contactado',
  EN_NEGOCIACION: 'En Negociación',
  CONFIRMADO: 'Confirmado',
  COMPLETADO: 'Completado',
  DESCARTADO: 'Descartado',
}

const ORIGEN_LABELS: Record<string, string> = {
  LANDING: 'Landing',
  WHATSAPP: 'WhatsApp',
  REDES: 'Redes',
  REFERIDO: 'Referido',
  OTRO: 'Otro',
}

function StatusBadge({ estado }: { estado: string }) {
  const style = STATUS_STYLES[estado] || STATUS_STYLES.DESCARTADO
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 text-[11px] font-medium px-2.5 py-0.5', style.badge)}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {STATUS_LABELS[estado] || estado}
    </Badge>
  )
}

/* ─── Component ──────────────────────────────────────────────────── */

export default function SolicitudesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [estadoFilter, setEstadoFilter] = useState<string>('all')
  const [servicioFilter, setServicioFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Detail dialog
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [newEstado, setNewEstado] = useState<string>('')
  const [notas, setNotas] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingNotas, setSavingNotas] = useState(false)

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (estadoFilter !== 'all') params.set('estado', estadoFilter)
      if (servicioFilter !== 'all') params.set('servicioInteresId', servicioFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/inquiries?${params}`)
      const json = await res.json()
      if (json.success) {
        setInquiries(json.data.inquiries)
        setTotalPages(json.data.pagination.totalPages)
        setTotal(json.data.pagination.total)
      } else {
        toast.error('Error al cargar solicitudes')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [page, estadoFilter, servicioFilter, search])

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services')
      const json = await res.json()
      if (json.success) {
        setServices(json.data)
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchInquiries()
  }, [fetchInquiries])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  function openDetail(inquiry: Inquiry) {
    setSelectedInquiry(inquiry)
    setNewEstado(inquiry.estado)
    setNotas(inquiry.notasInternas || '')
  }

  async function handleStatusChange() {
    if (!selectedInquiry) return
    setSavingStatus(true)
    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newEstado }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Estado actualizado')
        setSelectedInquiry({ ...selectedInquiry, estado: newEstado })
        fetchInquiries()
      } else {
        toast.error(json.error || 'Error al actualizar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSavingStatus(false)
    }
  }

  async function handleNotasSave() {
    if (!selectedInquiry) return
    setSavingNotas(true)
    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notasInternas: notas }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Notas guardadas')
        setSelectedInquiry({ ...selectedInquiry, notasInternas: notas })
      } else {
        toast.error(json.error || 'Error al guardar notas')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSavingNotas(false)
    }
  }

  function exportCSV() {
    const headers = ['Fecha', 'Nombre', 'Teléfono', 'Email', 'Servicio', 'Estado', 'Origen', 'Motivo']
    const rows = inquiries.map((i) => [
      format(new Date(i.createdAt), 'yyyy-MM-dd'),
      i.nombreCliente,
      i.telefono,
      i.email || '',
      i.servicioInteres?.nombre || '',
      i.estado,
      i.origen,
      `"${i.motivoConsulta.replace(/"/g, '\"')}"`,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `solicitudes_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Inbox}
        title="Solicitudes"
        description={`${total} solicitud${total !== 1 ? 'es' : ''} en total`}
      >
        <Button variant="outline" size="sm" onClick={fetchInquiries} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-1', loading && 'animate-spin')} />
          Actualizar
        </Button>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-1" />
          Exportar CSV
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, teléfono..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
            <Select value={estadoFilter} onValueChange={(v) => { setEstadoFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={servicioFilter} onValueChange={(v) => { setServicioFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los servicios</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No hay solicitudes</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Intenta cambiar los filtros
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Fecha</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                      <TableHead className="hidden lg:table-cell">Servicio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="hidden sm:table-cell">Origen</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((inquiry) => (
                      <TableRow key={inquiry.id} className="hover:bg-muted/50">
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(inquiry.createdAt), 'dd/MM/yy')}
                        </TableCell>
                        <TableCell className="font-medium">{inquiry.nombreCliente}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {inquiry.telefono}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm max-w-[150px] truncate">
                          {inquiry.servicioInteres?.nombre || '—'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge estado={inquiry.estado} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {ORIGEN_LABELS[inquiry.origen] || inquiry.origen}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetail(inquiry)}
                              className="h-8 text-xs"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Ver
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs text-violet-600 border-violet-200 hover:bg-violet-50"
                            >
                              <a
                                href={`https://wa.me/${inquiry.telefono.replace(/[^\d+]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Phone className="h-3.5 w-3.5 mr-1" />
                                Contactar
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="h-8 text-xs"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="h-8 w-8 text-xs p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="h-8 text-xs"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        {selectedInquiry && (
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalle de Solicitud</DialogTitle>
              <DialogDescription>
                Creada {formatDistanceToNow(new Date(selectedInquiry.createdAt), { addSuffix: true, locale: es })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Contact Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase">Nombre</p>
                    <p className="text-sm font-semibold truncate">{selectedInquiry.nombreCliente}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase">Teléfono</p>
                    <p className="text-sm font-semibold text-violet-600">{selectedInquiry.telefono}</p>
                  </div>
                </div>
                {selectedInquiry.email && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase">Email</p>
                      <p className="text-sm font-semibold truncate">{selectedInquiry.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">Servicio</p>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-violet-500" />
                    <p className="text-sm">{selectedInquiry.servicioInteres?.nombre || 'No especificado'}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">Origen</p>
                  <p className="text-sm">{ORIGEN_LABELS[selectedInquiry.origen] || selectedInquiry.origen}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Motivo de consulta</p>
                <p className="text-sm bg-muted rounded-lg p-3 whitespace-pre-wrap">
                  {selectedInquiry.motivoConsulta}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>
                  Creada el {format(new Date(selectedInquiry.createdAt), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}
                </span>
              </div>

              {/* Status Change */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-medium uppercase text-muted-foreground">
                  Cambiar Estado
                </Label>
                <div className="flex gap-2">
                  <Select value={newEstado} onValueChange={setNewEstado}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusChange}
                    disabled={savingStatus || newEstado === selectedInquiry.estado}
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {savingStatus && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                    Guardar
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase text-muted-foreground">
                  Notas Internas
                </Label>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Añadir notas internas sobre esta solicitud..."
                  rows={3}
                  className="resize-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNotasSave}
                  disabled={savingNotas || notas === (selectedInquiry.notasInternas || '')}
                >
                  {savingNotas && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                  Guardar Notas
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
