import { Server as SocketIOServer } from 'socket.io'
import https from 'https'
import http from 'http'
import { createIotBindings } from './createIotBindings'
import { createChatBindings } from './createChatBindings'
import { createWebRtcBindings } from './createWebRTCBindings'
import { createPortalBindings } from './createPortalBindings'

export const createSocketIOServer = (httpServer: http.Server | https.Server) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*'
    }
  })

  // createIotBindings(io)
  // createChatBindings(io)
  // createWebRtcBindings(io)
  createPortalBindings(io)

  io.sockets.on("error", e => {
    console.error('io.socket error:\n', e)
  })
}





