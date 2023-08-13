import { Server as SocketIOServer } from 'socket.io'
import http from 'http'

export const createSocketIOServer = (httpServer: http.Server) => {
  const io = new SocketIOServer(httpServer)

  setupVideoStream(io)
  setupChatExample(io)

  io.sockets.on("error", e => {
    console.error('io.socket error:\n', e)
  })
}

const setupVideoStream = (io: SocketIOServer) => {
  io.of('iot').on('connection', socket => {
    console.log('user of iot connected')

    socket.on('disconnect', () => {
      console.log('user of iot disconnected')
    })
  })

}

const setupChatExample = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log('user connected')
    socket.on('chat message', (msg) => {
      // emit to all except this socket, i think
      io.emit('chat message', msg)
    });
    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })
}