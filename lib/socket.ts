import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'

let io: SocketIOServer | null = null

export function getIO() {
  return io
}

export function initIO(httpServer: NetServer) {
  if (!io) {
    console.log('Initializing shared Socket.IO instance')
    io = new SocketIOServer(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      transports: ['polling', 'websocket'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000
    })

    io.on('connection', socket => {
      console.log('Client connected:', socket.id)

      socket.on('join-channel', (channelId: string) => {
        socket.join(`channel:${channelId}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  return io
}

export async function emitDataUpdate(channelId?: string) {
  if (!io) {
    console.warn('Socket.IO not initialized')
    return
  }

  try {
    const response = await fetch('/api/getData')
    const data = await response.json()
    
    if (channelId) {
      io.to(`channel:${channelId}`).emit('data-update', data)
    } else {
      io.emit('data-update', data)
    }
  } catch (error) {
    console.error('Error fetching data for socket update:', error)
  }
} 