import { Server, Socket } from "socket.io";



export const createWebRtcBindings = (io: Server) => {
  console.log('createWEbRTCBindings')
  const activeSockets = new Map<string, Socket>()

  io.of('webrtc')
    .on('connection', (socket) => {

      if (!activeSockets.has(socket.id)) {
        activeSockets.set(socket.id, socket)

        socket.emit("update-user-list", {
          users: [...activeSockets.keys()].filter(
            existingKey => existingKey !== socket.id
          )
        })

        socket.broadcast.emit("update-user-list", {
          users: [socket.id]
        })
      }

      socket.on('send-offer', ({ offer, to }: { offer: RTCSessionDescriptionInit, to: string }, callback: ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => void) => {
        const target = activeSockets.get(to)
        if (!target) {
          console.error('call-user: could not find target', to, 'no session!')
          return
        }

        target.emit('get-answer', {
          offer,
          from: socket.id
        }, ({ answer }: { answer: RTCSessionDescriptionInit }) => {
          callback({ answer, from: to })
        })
      })

      socket.on('disconnect', () => {
        activeSockets.delete(socket.id)
        socket.broadcast.emit('remove-user', socket.id)
      })
    })
}