import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdminFromRequest, apiResponse, apiError } from '@/lib/auth'

// ─── GET (protected) ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdminFromRequest(req)
    if (!admin) {
      return apiError('No autenticado', 401)
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Run all queries in parallel
    const [
      totalInquiries,
      inquiriesByStatus,
      inquiriesPerDay,
      topServices,
      totalContactMessages,
    ] = await Promise.all([
      // Total inquiries count
      db.inquiry.count(),

      // Inquiries by status count
      db.inquiry.groupBy({
        by: ['estado'],
        _count: { estado: true },
      }),

      // Inquiries per day (last 30 days)
      db.inquiry.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),

      // Top services by inquiry count
      db.service.findMany({
        include: {
          _count: {
            select: { inquiries: true },
          },
        },
        orderBy: {
          inquiries: { _count: 'desc' },
        },
        take: 10,
      }),

      // Total contact messages
      db.contactMessage.count(),
    ])

    // Convert status counts to a record
    const statusCounts: Record<string, number> = {}
    for (const item of inquiriesByStatus) {
      statusCounts[item.estado] = item._count.estado
    }

    // Group inquiries by day
    const dailyCounts: Record<string, number> = {}
    for (const inquiry of inquiriesPerDay) {
      const dateKey = inquiry.createdAt.toISOString().split('T')[0]
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1
    }

    // Fill in missing days with 0
    const dailyData: { date: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().split('T')[0]
      dailyData.push({
        date: dateKey,
        count: dailyCounts[dateKey] || 0,
      })
    }

    // Top services formatted
    const topServicesData = topServices.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      categoria: s.categoria,
      inquiryCount: s._count.inquiries,
    }))

    // Conversion rate: (contactado + en_negociacion + confirmado + completado) / total * 100
    const convertedStatuses = ['CONTACTADO', 'EN_NEGOCIACION', 'CONFIRMADO', 'COMPLETADO']
    let convertedCount = 0
    for (const status of convertedStatuses) {
      convertedCount += statusCounts[status] || 0
    }
    const conversionRate = totalInquiries > 0 ? Math.round((convertedCount / totalInquiries) * 100) : 0

    return apiResponse({
      totalInquiries,
      inquiriesByStatus: statusCounts,
      inquiriesPerDay: dailyData,
      topServices: topServicesData,
      conversionRate,
      totalContactMessages,
    })
  } catch {
    return apiError('Error al obtener las estadísticas', 500)
  }
}
