import { Server as SocketIOServer } from 'socket.io'
import type https from 'https'
import type http from 'http'
import { createPortalBindings } from './createPortalBindings'

export const createSocketIOServer = (httpServer: http.Server | https.Server) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*'
    }
  })

  createPortalBindings(io)

  io.sockets.on("error", e => {
    console.error('io.socket error:\n', e)
  })
}