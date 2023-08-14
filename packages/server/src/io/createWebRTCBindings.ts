import { Server, Socket } from "socket.io";



export const createWebRtcBindings = (io: Server) => {
  console.log('createWEbRTCBindings')
  const activeSockets = new Map<string, Socket>()

  io.of('webrtc').on('connection', (socket) => {

    if (!activeSockets.has(socket.id)) {
      activeSockets.set(socket.id, socket)

      socket.emit("update-user-list", {
        users: [...activeSockets.values()].filter(
          existingSocket => existingSocket.id !== socket.id
        )
      })

      socket.broadcast.emit("update-user-list", {
        users: [socket.id]
      })
    }

    socket.on('disconnect', () => activeSockets.delete(socket.id))
  })
}