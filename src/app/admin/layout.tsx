'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Moon,
  LayoutDashboard,
  Inbox,
  Package,
  Star,
  Mail,
  Users,
  LogOut,
  Loader2,
  ShieldCheck,
  Search,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuBadge,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AdminSession {
  id: string
  nombre: string
  email: string
  rol: 'SUPERADMIN' | 'ADMIN'
  activo: boolean
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  superAdminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Solicitudes', href: '/admin/solicitudes', icon: Inbox },
  { label: 'Servicios', href: '/admin/servicios', icon: Package },
  { label: 'Testimonios', href: '/admin/testimonios', icon: Star },
  { label: 'Contacto', href: '/admin/contacto', icon: Mail },
  { label: 'Administradores', href: '/admin/administradores', icon: Users, superAdminOnly: true },
]

function AdminSidebar({ session, nuevoCount }: { session: AdminSession; nuevoCount: number }) {
  const pathname = usePathname()
  const filteredNav = navItems.filter(
    (item) => !item.superAdminOnly || session.rol === 'SUPERADMIN'
  )

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-sm shadow-violet-600/30">
            <Moon className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-foreground leading-tight">
              Retornos y Amarres
            </span>
            <span className="text-[11px] text-muted-foreground">Panel Admin</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {filteredNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const badgeCount = item.label === 'Solicitudes' ? nuevoCount : undefined
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        'h-9 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-violet-600 text-white font-medium shadow-sm shadow-violet-600/30 hover:bg-violet-600 hover:text-white'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {badgeCount !== undefined && badgeCount > 0 && (
                      <SidebarMenuBadge
                        className={cn(
                          'rounded-full text-[10px]',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-violet-100 text-violet-700'
                        )}
                      >
                        {badgeCount}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 rounded-xl bg-accent/60 px-3 py-2.5">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
              session.rol === 'SUPERADMIN'
                ? 'bg-gradient-to-br from-violet-500 to-violet-700'
                : 'bg-gradient-to-br from-slate-400 to-slate-600'
            )}
          >
            {session.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold truncate text-foreground">
              {session.nombre}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">{session.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function TopBar({ session, onLogout }: { session: AdminSession; onLogout: () => void }) {
  const pathname = usePathname()
  const currentPage = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  )
  const PageIcon = currentPage?.icon || Moon

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
          <PageIcon className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold leading-tight">{currentPage?.label || 'Panel'}</h1>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Panel de administración
          </p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Buscar...</span>
          <kbd className="rounded border bg-background px-1 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'gap-1 border-violet-200 bg-violet-50 text-violet-700 text-[10px] px-2 py-0.5',
            session.rol === 'SUPERADMIN' && 'border-amber-200 bg-amber-50 text-amber-700'
          )}
        >
          <ShieldCheck className="h-3 w-3" />
          {session.rol === 'SUPERADMIN' ? 'Super Admin' : 'Admin'}
        </Badge>
        <div className="hidden sm:flex items-center gap-2.5 border-l border-border pl-3">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
              session.rol === 'SUPERADMIN'
                ? 'bg-gradient-to-br from-violet-500 to-violet-700'
                : 'bg-gradient-to-br from-slate-400 to-slate-600'
            )}
          >
            {session.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold leading-tight truncate max-w-[160px]">
              {session.nombre}
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight truncate max-w-[160px]">
              {session.email}
            </span>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cerrar sesión</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [nuevoCount, setNuevoCount] = useState(0)

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      const json = await res.json()
      if (!res.ok || !json.success) {
        if (isLoginPage) {
          setSession(null)
          return
        }
        router.push('/admin/login')
        return
      }
      setSession(json.data)
      if (isLoginPage) {
        router.replace('/admin')
      }
    } catch {
      if (!isLoginPage) router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [router, isLoginPage])

  const fetchNuevoCount = useCallback(async () => {
    try {
      const res = await fetch('/api/inquiries?estado=NUEVO&limit=1')
      const json = await res.json()
      if (json.success) {
        setNuevoCount(json.data.pagination?.total || 0)
      }
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  useEffect(() => {
    if (session && !isLoginPage) fetchNuevoCount()
  }, [session, isLoginPage, fetchNuevoCount])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Sesión cerrada')
      router.push('/admin/login')
    } catch {
      toast.error('Error al cerrar sesión')
    }
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-lg shadow-violet-600/20">
            <Moon className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="light min-h-screen bg-background">
      <SidebarProvider>
        <AdminSidebar session={session} nuevoCount={nuevoCount} />
        <SidebarInset className="bg-gradient-to-br from-violet-50/60 via-background to-background">
          <TopBar session={session} onLogout={handleLogout} />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
