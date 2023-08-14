import { Server } from "socket.io";

export const createChatBindings = (io: Server) => {
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