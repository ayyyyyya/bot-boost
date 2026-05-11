import { App } from '@neoxr/webly'
import './controllers/global.js'
import middleware from './middlewares/index.js'
import path from 'path'
import { clone } from '../lib/system/mapping.js'
import { randomUUID } from 'crypto'
const onlineUsers = new Map()

const app = new App({
   staticPath: ['nuxt/.output/public'],
   routePath: './core/routes',
   middleware,
   socket: true,
   socketOpts: {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      pingInterval: 25000,
      pingTimeout: 5000
   },
   session: {
      name: 'token',
      keys: ['session'],
      maxAge: 72 * 60 * 60 * 1000, // 3 days
      httpOnly: false,
      sameSite: 'strict'
   },
   cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: '*',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      exposedHeaders: '*',
      credentials: true
   },
   error: (req, res) => {
      res.sendFile(path.join(process.cwd(), 'nuxt/.output/public', '404.html'))
   }
})

app?.socket?.on('connection', (socket) => {
   console.log('🟢 Client connected:', socket.id)

   socket.on('register_session', (persistentSessionId) => {
      let currentSessionId = persistentSessionId

      if (!currentSessionId || !onlineUsers.has(currentSessionId)) {
         currentSessionId = randomUUID()
         socket.emit('session_established', currentSessionId)
      } else {
         console.log(`Client ${currentSessionId} reconnected with new socket ID: ${socket.id}`)
      }

      const user = onlineUsers.get(currentSessionId)
      if (user && user.disconnectionTimer) {
         clearTimeout(user.disconnectionTimer)
      }

      onlineUsers.set(currentSessionId, {
         socketId: socket.id,
         disconnectionTimer: null
      })
   })

   socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id)

      let userSessionId = null
      for (const [sessionId, user] of onlineUsers.entries()) {
         if (user.socketId === socket.id) {
            userSessionId = sessionId
            break
         }
      }

      if (userSessionId) {
         const user = onlineUsers.get(userSessionId)
         user.disconnectionTimer = setTimeout(() => {
            onlineUsers.delete(userSessionId)
         }, 30000)
      }
   })
})

app.use((req, res, next) => {
   req.bot = clone.get('sync')
   next()
})

app.start()