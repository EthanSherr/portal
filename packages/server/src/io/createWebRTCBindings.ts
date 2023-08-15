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

      socket.on('call-user', ({ offer, to }: { offer: RTCSessionDescriptionInit, to: string }) => {
        const target = activeSockets.get(to)
        if (!target) {
          console.error('call-user: could not find target', to, 'no session!')
          return
        }

        target.emit('call-made', {
          offer,
          from: socket.id
        })
      })

      socket.on('make-answer', ({ answer, to }: { answer: RTCSessionDescriptionInit, to: string }) => {
        const target = activeSockets.get(to)
        if (!target) {
          console.error('call-made fail: could not find target', to, 'no session!')
          return
        }

        target.emit('answer-made', {
          from: socket.id,
          answer
        })
      })

      socket.on('disconnect', () => {
        activeSockets.delete(socket.id)
        socket.broadcast.emit('remove-user', socket.id)
      })
    })
}