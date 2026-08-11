'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Eye,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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

interface ContactMessage {
  id: string
  nombre: string
  email: string
  telefono: string | null
  mensaje: string
  atendido: boolean
  createdAt: string
  updatedAt: string
}

/* ─── Component ──────────────────────────────────────────────────── */

export default function ContactoPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState<string>('all')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Detail dialog
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (filter !== 'all') params.set('atendido', filter)

      const res = await fetch(`/api/contact?${params}`)
      const json = await res.json()
      if (json.success) {
        setMessages(json.data.messages)
        setTotalPages(json.data.pagination.totalPages)
        setTotal(json.data.pagination.total)
      } else {
        toast.error('Error al cargar mensajes')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  async function handleToggleAtendido(msg: ContactMessage) {
    setTogglingId(msg.id)
    try {
      const res = await fetch(`/api/contact/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ atendido: !msg.atendido }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(msg.atendido ? 'Marcado como no atendido' : 'Marcado como atendido')
        fetchMessages()
      } else {
        toast.error(json.error || 'Error al actualizar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Mail}
        title="Mensajes de Contacto"
        description={`${total} mensaje${total !== 1 ? 's' : ''} recibidos`}
      >
        <Button variant="outline" size="sm" onClick={fetchMessages} disabled={loading}>
          <RefreshCw className={loading ? 'h-4 w-4 mr-1 animate-spin' : 'h-4 w-4 mr-1'} />
          Actualizar
        </Button>
        <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="false">No atendidos</SelectItem>
            <SelectItem value="true">Atendidos</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No hay mensajes</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Los mensajes del formulario de contacto aparecerán aquí
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Mensaje</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg.id} className={!msg.atendido ? 'bg-amber-50/30' : ''}>
                        <TableCell>
                          <p className="font-medium text-sm">{msg.nombre}</p>
                          {msg.telefono && (
                            <p className="text-[11px] text-muted-foreground">{msg.telefono}</p>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {msg.email}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm max-w-[200px] truncate">
                          {msg.mensaje}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={msg.atendido}
                              onCheckedChange={() => handleToggleAtendido(msg)}
                              disabled={togglingId === msg.id}
                            />
                            <span className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded-full',
                              msg.atendido
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            )}>
                              {msg.atendido ? 'Atendido' : 'Pendiente'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {format(new Date(msg.createdAt), 'dd/MM/yy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMessage(msg)}
                            className="h-8 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Ver
                          </Button>
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
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        {selectedMessage && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Mensaje de Contacto</DialogTitle>
              <DialogDescription>
                Recibido el {format(new Date(selectedMessage.createdAt), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">Nombre</p>
                  <p className="text-sm font-medium">{selectedMessage.nombre}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">Email</p>
                  <p className="text-sm font-medium text-violet-600">{selectedMessage.email}</p>
                </div>
                {selectedMessage.telefono && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase">Teléfono</p>
                    <p className="text-sm">{selectedMessage.telefono}</p>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Mensaje</p>
                <div className="text-sm bg-muted rounded-lg p-3 whitespace-pre-wrap">
                  {selectedMessage.mensaje}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[11px]',
                    selectedMessage.atendido
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-amber-100 text-amber-700 border-amber-200'
                  )}
                >
                  {selectedMessage.atendido ? 'Atendido' : 'Pendiente'}
                </Badge>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
