'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Inbox,
  TrendingUp,
  PhoneCall,
  CheckCircle2,
  BarChart3,
  Mail,
  LayoutDashboard,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'

interface Stats {
  totalInquiries: number
  inquiriesByStatus: Record<string, number>
  inquiriesPerDay: { date: string; count: number }[]
  topServices: { id: string; nombre: string; categoria: string; inquiryCount: number }[]
  conversionRate: number
  totalContactMessages: number
}

const STATUS_COLORS: Record<string, string> = {
  NUEVO: '#ef4444',
  CONTACTADO: '#3b82f6',
  EN_NEGOCIACION: '#f59e0b',
  CONFIRMADO: '#10b981',
  COMPLETADO: '#059669',
  DESCARTADO: '#9ca3af',
}

const STATUS_LABELS: Record<string, string> = {
  NUEVO: 'Nuevas',
  CONTACTADO: 'Contactadas',
  EN_NEGOCIACION: 'En Negociación',
  CONFIRMADO: 'Confirmadas',
  COMPLETADO: 'Completadas',
  DESCARTADO: 'Descartadas',
}

const chartConfig = {
  count: { label: 'Consultas', color: '#7c3aed' },
}

const barChartConfig = {
  inquiryCount: { label: 'Consultas', color: '#7c3aed' },
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats')
        const json = await res.json()
        if (json.success) {
          setStats(json.data)
        } else {
          toast.error('Error al cargar estadísticas')
        }
      } catch {
        toast.error('Error de conexión')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No se pudieron cargar las estadísticas</p>
      </div>
    )
  }

  const nuevo = stats.inquiriesByStatus.NUEVO || 0
  const enProceso = (stats.inquiriesByStatus.CONTACTADO || 0) + (stats.inquiriesByStatus.EN_NEGOCIACION || 0)
  const completadas = stats.inquiriesByStatus.COMPLETADO || 0

  const dailyData = stats.inquiriesPerDay.map((d) => ({
    ...d,
    date: d.date.slice(5), // MM-DD format
  }))

  const pieData = Object.entries(stats.inquiriesByStatus).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    fill: STATUS_COLORS[status] || '#9ca3af',
  }))

  const topServicesData = stats.topServices
    .filter((s) => s.inquiryCount > 0)
    .slice(0, 7)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Resumen general de la actividad"
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Solicitudes" value={stats.totalInquiries} icon={Inbox} color="violet" />
        <StatCard
          title="Nuevas"
          value={nuevo}
          icon={BarChart3}
          color="red"
          hint="Requieren atención"
        />
        <StatCard title="En Proceso" value={enProceso} icon={PhoneCall} color="amber" />
        <StatCard title="Completadas" value={completadas} icon={CheckCircle2} color="emerald" />
        <StatCard title="Tasa Conversión" value={`${stats.conversionRate}%`} icon={TrendingUp} color="blue" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Inquiries Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consultas por día</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  interval={4}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución por estado</CardTitle>
            <CardDescription>Solicitudes actuales</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[280px] w-full">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Services Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Servicios más consultados</CardTitle>
            <CardDescription>Top servicios por cantidad de solicitudes</CardDescription>
          </CardHeader>
          <CardContent>
            {topServicesData.length > 0 ? (
              <ChartContainer config={barChartConfig} className="h-[260px] w-full">
                <BarChart data={topServicesData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    width={140}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="inquiryCount"
                    fill="var(--color-inquiryCount)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                No hay datos de servicios aún
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Messages Summary */}
      <Card className="bg-gradient-to-r from-violet-50 to-transparent border-violet-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Mensajes de contacto</p>
              <p className="text-3xl font-bold tabular-nums mt-1 text-foreground">
                {stats.totalContactMessages}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Recibidos desde el formulario de la landing
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 ring-1 ring-violet-200/70">
              <Mail className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Helper Components ──────────────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60 mt-2" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
