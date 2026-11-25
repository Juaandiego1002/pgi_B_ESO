import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  await prisma.$queryRawUnsafe('SELECT 1')
  console.log('SQLite OK')
}
catch (error) {
  console.error('SQLite no responde:', error)
  process.exit(1)
}
finally {
  await prisma.$disconnect()
}
