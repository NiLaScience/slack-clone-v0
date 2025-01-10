import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

export function getIO(): SocketIOServer | null
export function initIO(httpServer: NetServer): SocketIOServer
export function emitDataUpdate(channelId?: string): Promise<void> 