import Fastify from 'fastify'
import cors from '@fastify/cors'
import formbody from '@fastify/formbody'
import jwt from '@fastify/jwt'
import { config } from './config.js'
import authRoutes from './routes/auth.js'
import eventRoutes from './routes/events.js'

const app = Fastify({ logger: true })

// CORS
await app.register(cors, {
  origin: true,
  credentials: true,
})

// Form body parsing
await app.register(formbody)

// JWT
await app.register(jwt, {
  secret: config.jwt.secret,
})

// Auth decorator
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: '未登录或登录已过期' })
  }
})

// Health check
app.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Routes
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(eventRoutes, { prefix: '/api/events' })

// Start
try {
  await app.listen({ port: config.server.port, host: config.server.host })
  console.log(`Server running at http://${config.server.host}:${config.server.port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
