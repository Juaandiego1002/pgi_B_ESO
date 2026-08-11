import { hash } from 'bcryptjs'
import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Admins ────────────────────────────────────────────────────────
  const superAdminPwd = await hash('Admin1234', 12)
  await db.adminUser.upsert({
    where: { email: 'admin@retornosyamarres.com' },
    update: {},
    create: {
      nombre: 'Maestra Luna',
      email: 'admin@retornosyamarres.com',
      passwordHash: superAdminPwd,
      rol: 'SUPERADMIN',
    },
  })
  console.log('✅ SuperAdmin creado: admin@retornosyamarres.com / Admin1234')

  const operadorPwd = await hash('Operador123', 12)
  await db.adminUser.upsert({
    where: { email: 'operador@retornosyamarres.com' },
    update: {},
    create: {
      nombre: 'Operador Carlos',
      email: 'operador@retornosyamarres.com',
      passwordHash: operadorPwd,
      rol: 'ADMIN',
    },
  })
  console.log('✅ Operador creado: operador@retornosyamarres.com / Operador123')

  // ─── Servicios ──────────────────────────────────────────────────────
  const servicios = await Promise.all([
    db.service.create({
      data: {
        nombre: 'Lectura de Tarot Completa',
        descripcion: 'Lectura profunda de 12 cartas que revela tu pasado, presente y futuro en amor, trabajo y espiritualidad. Incluye guía personalizada.',
        categoria: 'Tarot',
        precio: 85000,
        activo: true,
        orden: 1,
      },
    }),
    db.service.create({
      data: {
        nombre: 'Retorno de Pareja',
        descripcion: 'Ritual espiritual poderoso para reconectar con tu ser amado. Trabajo energético de alta vibración con velas, oraciones y canalización.',
        categoria: 'Amarres',
        precio: 250000,
        activo: true,
        orden: 2,
      },
    }),
    db.service.create({
      data: {
        nombre: 'Amarre de Amor Eterno',
        descripcion: 'Vinculación espiritual profunda para fortalecer y unir dos almas. Incluye seguimiento energético por 7 días.',
        categoria: 'Amarres',
        precio: 350000,
        activo: true,
        orden: 3,
      },
    }),
    db.service.create({
      data: {
        nombre: 'Limpieza Energética Total',
        descripcion: 'Eliminación de malas vibras, envidias y bloqueos espirituales. Restaura tu campo áurico y renueva tu energía vital.',
        categoria: 'Limpieza',
        precio: 120000,
        activo: true,
        orden: 4,
      },
    }),
    db.service.create({
      data: {
        nombre: 'Ritual de Prosperidad',
        descripcion: 'Abre los canales de abundancia y atrae la prosperidad económica a tu vida. Trabajo con energías de la tierra y el sol.',
        categoria: 'Rituales',
        precio: 180000,
        activo: true,
        orden: 5,
      },
    }),
    db.service.create({
      data: {
        nombre: 'Lectura de Vida Pasada',
        descripcion: 'Viaje regresivo para descubrir tus vidas pasadas y entender patrones kármicos que afectan tu presente.',
        categoria: 'Lecturas',
        precio: 150000,
        activo: true,
        orden: 6,
      },
    }),
    db.service.create({
      data: {
        nombre: 'Lectura Rápida (3 cartas)',
        descripcion: 'Respuestas rápidas y directas a una pregunta específica. Ideal para quienes buscan guía inmediata.',
        categoria: 'Tarot',
        precio: 45000,
        activo: true,
        orden: 7,
      },
    }),
    db.service.create({
      data: {
        nombre: 'Ritual de Protección',
        descripcion: 'Escudo espiritual contra energías negativas, brujería y malas intenciones. Protección duradera para ti y tu hogar.',
        categoria: 'Rituales',
        precio: 200000,
        activo: true,
        orden: 8,
      },
    }),
  ])
  console.log(`✅ ${servicios.length} servicios creados`)

  // ─── Testimonios ─────────────────────────────────────────────────────
  await db.testimonial.createMany({
    data: [
      {
        nombre: 'María G.',
        servicioId: servicios[0].id,
        calificacion: 5,
        comentario: 'La lectura fue increíblemente precisa. Me dijo cosas que nadie sabía. ¡Totalmente recomendada!',
        aprobado: true,
      },
      {
        nombre: 'Carlos L.',
        servicioId: servicios[3].id,
        calificacion: 5,
        comentario: 'Después de la limpieza sentí una paz que no tenía hacía meses. Mi energía cambió por completo.',
        aprobado: true,
      },
      {
        nombre: 'Ana P.',
        servicioId: servicios[1].id,
        calificacion: 5,
        comentario: 'Mi pareja regresó a los 5 días del ritual. Estoy muy agradecida con la Maestra Luna.',
        aprobado: true,
      },
      {
        nombre: 'Laura M.',
        servicioId: servicios[7].id,
        calificacion: 5,
        comentario: 'Desde que hice el ritual de protección, las cosas negativas dejaron de pasar en mi casa. Funciona de verdad.',
        aprobado: true,
      },
      {
        nombre: 'Sofía R.',
        servicioId: servicios[2].id,
        calificacion: 4,
        comentario: 'El amarre funcionó, mi relación se fortaleció mucho. Muy profesionales.',
        aprobado: true,
      },
      {
        nombre: 'Pedro V.',
        servicioId: null,
        calificacion: 3,
        comentario: 'Buena atención pero tardé un poco en recibir respuesta. El resultado final sí fue bueno.',
        aprobado: false,
      },
    ],
  })
  console.log('✅ 6 testimonios creados')

  // ─── Solicitudes de ejemplo ──────────────────────────────────────────
  const now = new Date()
  const day = (d: number) => new Date(now.getTime() - d * 86_400_000)

  await db.inquiry.createMany({
    data: [
      {
        nombreCliente: 'Valentina Morales',
        telefono: '+57 315 999 0000',
        email: 'valentina@email.com',
        servicioInteresId: servicios[1].id,
        motivoConsulta: 'Mi novio me dejó hace 2 meses y quiero que vuelva. Estamos en contacto pero él es frío. Necesito ayuda urgente por favor.',
        estado: 'NUEVO',
        origen: 'LANDING',
        createdAt: day(0),
      },
      {
        nombreCliente: 'Camila Torres',
        telefono: '+57 320 111 2233',
        email: 'camila.t@email.com',
        servicioInteresId: servicios[0].id,
        motivoConsulta: 'Quiero saber qué me depara el futuro en el amor. Estoy en una etapa de confusión y necesito guía espiritual.',
        estado: 'CONTACTADO',
        notasInternas: 'Se le envió WhatsApp el 12/01. Esperando respuesta para agendar.',
        origen: 'LANDING',
        createdAt: day(1),
      },
      {
        nombreCliente: 'Diego Ramírez',
        telefono: '+57 310 444 5566',
        email: null,
        servicioInteresId: servicios[4].id,
        motivoConsulta: 'Necesito abrir mis caminos de abundancia. He tenido muchos problemas económicos últimamente y creo que hay un bloqueo.',
        estado: 'CONFIRMADO',
        notasInternas: 'Confirmó el ritual. Pago recibido por Nequi.',
        origen: 'WHATSAPP',
        createdAt: day(3),
      },
      {
        nombreCliente: 'Andrea López',
        telefono: '+57 305 777 8899',
        email: 'andrea.l@email.com',
        servicioInteresId: servicios[3].id,
        motivoConsulta: 'Siento que tengo mala suerte desde hace meses. Se me han cerrado las puertas en el trabajo y en el amor. Necesito una limpieza urgente.',
        estado: 'COMPLETADO',
        notasInternas: 'Limpieza realizada el 8/01. Cliente reporta sentirse mucho mejor.',
        origen: 'REFERIDO',
        createdAt: day(7),
      },
      {
        nombreCliente: 'Juan Pablo',
        telefono: '+57 300 222 3344',
        email: 'jp@email.com',
        servicioInteresId: null,
        motivoConsulta: 'No estoy seguro de qué servicio necesito. Tengo problemas con mi ex que no me deja en paz y creo que me hizo algo. ¿Qué me recomiendan?',
        estado: 'EN_NEGOCIACION',
        notasInternas: 'Se le sugirió limpieza + protección. Esperando que confirme.',
        origen: 'REDES',
        createdAt: day(2),
      },
      {
        nombreCliente: 'Luisa Fernández',
        telefono: '+57 312 555 6677',
        email: 'luisa.f@email.com',
        servicioInteresId: servicios[2].id,
        motivoConsulta: 'Quiero un amarre de amor para mi pareja que está distante. Llevamos 5 años pero últimamente se ha alejado mucho.',
        estado: 'DESCARTADO',
        notasInternas: 'No volvió a responder. Se le envió 3 mensajes sin respuesta.',
        origen: 'LANDING',
        createdAt: day(14),
      },
      {
        nombreCliente: 'Gabriela Martínez',
        telefono: '+57 318 888 9900',
        email: 'gabi.m@email.com',
        servicioInteresId: servicios[7].id,
        motivoConsulta: 'Creo que me han hecho brujería. Tengo pesadillas, me siento acosada y las cosas se rompen solas en mi casa.',
        estado: 'NUEVO',
        origen: 'LANDING',
        createdAt: day(0),
      },
      {
        nombreCliente: 'Ricardo Herrera',
        telefono: '+57 314 333 4455',
        email: null,
        servicioInteresId: servicios[5].id,
        motivoConsulta: 'Quiero conocer mis vidas pasadas. Siento una conexión muy fuerte con ciertos lugares y personas que no puedo explicar.',
        estado: 'CONTACTADO',
        origen: 'OTRO',
        createdAt: day(5),
      },
    ],
  })
  console.log('✅ 8 solicitudes de ejemplo creadas')

  // ─── Mensajes de contacto de ejemplo ─────────────────────────────────
  await db.contactMessage.createMany({
    data: [
      {
        nombre: 'Patricia Gómez',
        email: 'patricia@email.com',
        telefono: '+57 311 000 1122',
        mensaje: 'Hola, quiero saber más sobre los retornos de pareja. ¿Cuánto tiempo tardan en funcionar?',
        atendido: false,
      },
      {
        nombre: 'Fernando Castro',
        email: 'fer.castro@email.com',
        telefono: null,
        mensaje: 'Necesito una limpieza urgente, siento mucha energía pesada a mi alrededor. ¿Pueden ayudarme hoy mismo?',
        atendido: true,
      },
    ],
  })
  console.log('✅ 2 mensajes de contacto creados')

  console.log('\n🌟 ¡Seed completado exitosamente!')
  console.log('═══════════════════════════════════════════')
  console.log('🔐 SuperAdmin: admin@retornosyamarres.com / Admin1234')
  console.log('🔧 Operador:  operador@retornosyamarres.com / Operador123')
  console.log('═══════════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
