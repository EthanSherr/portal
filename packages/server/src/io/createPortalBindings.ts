import { Socket, Server as SocketIOServer } from 'socket.io'

type PortalData = {
  portal: Socket
  viewers: Array<Socket>
}

class PortalManager {
  portals: Map<string, PortalData>
  sockets: Map<string, Socket>

  constructor() {
    this.portals = new Map<string, PortalData>()
    this.sockets = new Map<string, Socket>()
  }

  registerPortal = (socket: Socket, name: string) => {
    console.log(`registerPortal("${socket.id}", "${name}")`)
    // if (this.portals.has(name)) {
    //   console.error('Error: socket is already registered', { name, socketId: this.portals.get(name)?.portal.id })
    //   return
    // }
    this.portals.set(name, { portal: socket, viewers: [] })
    this.debug()
  }

  setSocket = (socket: Socket) => {
    this.sockets.set(socket.id, socket)
  }

  getSocket = (id: string) => {
    return this.sockets.get(id)
  }

  removeSocket = (socket: Socket) => {
    this.sockets.delete(socket.id)
  }

  getPortal = (name: string): PortalData | undefined => {
    return this.portals.get(name)
  }

  debug = () => {
    console.log('debug', { portals: [...this.portals.keys()], sockets: [...this.sockets.keys()] })
  }
}

export const createPortalBindings = (io: SocketIOServer) => {

  const portalManager = new PortalManager()

  io.of('portal')
    .on('connection', (socket) => {
      console.log('connection', socket.id)
      portalManager.setSocket(socket)

      socket.on('register-portal', (name: string) => {
        portalManager.registerPortal(socket, name)
      })

      // someone is trying to open the portal!
      socket.on('send-offer', ({ offer, to }: { offer: RTCSessionDescriptionInit, to: string }, handleOnAnswer: ({ answer }: { answer: RTCSessionDescriptionInit }) => void) => {
        const portalData = portalManager.getPortal(to)
        if (!portalData) {
          return console.error('no portal for name', to)
        }

        const payload = { offer, from: socket.id }
        console.log('send-offer => get-portal-session')

        portalData.portal.emit('get-answer', payload, (answer: RTCSessionDescriptionInit) => {
          handleOnAnswer({ answer })
          portalData.portal.emit('add-viewers', { viewers: [socket.id] })
          socket.on('disconnect', () => {
            portalData.portal.emit('remove-viewers', { viewers: [socket.id] })
          })
        })
      })

      socket.on('disconnect', () => {
        console.log('socket.id', socket.id)
      })
    })
}