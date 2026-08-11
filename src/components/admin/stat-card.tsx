'use client'

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
} from '@/components/ui/card'

type StatColor = 'violet' | 'red' | 'amber' | 'emerald' | 'blue' | 'slate'

const COLOR_STYLES: Record<StatColor, { chip: string; bar: string }> = {
  violet: { chip: 'bg-violet-100 text-violet-600', bar: 'bg-violet-500' },
  red: { chip: 'bg-red-100 text-red-600', bar: 'bg-red-500' },
  amber: { chip: 'bg-amber-100 text-amber-600', bar: 'bg-amber-500' },
  emerald: { chip: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500' },
  blue: { chip: 'bg-blue-100 text-blue-600', bar: 'bg-blue-500' },
  slate: { chip: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' },
}

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color: StatColor
  hint?: string
}

export function StatCard({ title, value, icon: Icon, color, hint }: StatCardProps) {
  const styles = COLOR_STYLES[color]

  return (
    <Card className="relative overflow-hidden">
      <div className={cn('absolute inset-x-0 top-0 h-0.5', styles.bar)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {typeof value === 'number' ? value.toLocaleString('es-CO') : value}
            </p>
            {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', styles.chip)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
