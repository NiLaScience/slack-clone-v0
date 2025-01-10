import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { IncomingMessage, ServerResponse } from 'http'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export type SocketServer = NetServer & {
  io: SocketIOServer
}

export type SocketRequest = Request & {
  socket: {
    server: SocketServer
  }
} 