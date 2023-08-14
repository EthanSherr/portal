import { Socket, Server as SocketIOServer } from 'socket.io'
import https from 'https'
import http from 'http'

export const createSocketIOServer = (httpServer: http.Server | https.Server) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*'
    }
  })

  setupVideoStream(io)
  setupChatExample(io)

  io.sockets.on("error", e => {
    console.error('io.socket error:\n', e)
  })
}

// https://chinleongkeh.medium.com/video-stream-from-raspberry-pi-using-express-js-socket-io-pi-camera-connect-2e9b79a288ea
const setupVideoStream = (io: SocketIOServer) => {

  const iotDevices = new Map<IOTDeviceId, Socket>()
  const rooms = new Map<RoomName, Map<string, Socket>>()

  io.of('iot').on('connection', socket => {
    const address = socket.handshake.address
    console.log(`on('connection') `, { address })

    // handle video stream init
    socket.on('pi-cam-init', (iotDeviceId) => {
      console.log(`on('pi-cam-init') `, { iotDeviceId })
      const roomName = getRoomName(iotDeviceId)
      const socketForIodDevice = iotDevices.get(iotDeviceId)
      if (!socketForIodDevice) {
        socket.join(roomName)

        if (!rooms.has(roomName)) {
          rooms.set(roomName, new Map<string, Socket>())
        }
        rooms.get(roomName)!.set(socket.id, socket)

        iotDevices.set(iotDeviceId, socket)
      } else if (socketForIodDevice !== socket) {
        console.log('camera socket different from map, adding new socket into map')
        socketForIodDevice.leave(roomName)
        socket.join(roomName)
        iotDevices.set(iotDeviceId, socket)
      }

      // console.log('iotDevices', iotDevices)
      // console.log('rooms', rooms)
    })

    // handle video stream
    socket.on('pi-video-stream', (data, res) => {
      const roomName = getRoomName(data)
      console.log(`on('pi-video-stream')`, { roomName, reslength: res.length })
      socket.to(roomName).emit('consumer-receive-feed', res)
    })

    // handle video stream disconnects
    socket.on('pi-disconnect', (data, res) => {
      console.log("Disconnect from pi camera ", address)
      const roomName = getRoomName(data)

      rooms.delete(roomName)

      socket.to(roomName).emit('pi-terminate-broacast')
      // res('Pi camera disconnected from server.')
    })

    socket.on('consumer-start-viewing', (iotDevice, res) => {

      if (!iotDevices.has(iotDevice)) {
        // res('Camera is not online')
        console.error(`on('consumer-start-viewing') No device found!`, { iotDevice })
        console.error('iotDevices', iotDevices)
        return
      }
      console.log(`on('consumer-start-viewing')`, { address, iotDevice })


      const roomName = getRoomName(iotDevice)
      socket.join(roomName)
      if (!rooms.has(roomName)) {
        rooms.set(roomName, new Map<string, Socket>())
      }
      rooms.get(roomName)?.set(socket.id, socket)

      const cameraSocket = iotDevices.get(iotDevice)!
      cameraSocket.emit('new-consumer', socket.id, () => {
        console.log('new consumer has joined ', iotDevice, 'stream')
      })
      // res("Connect to " + cameraSocket.id + " steam");


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


const getRoomName = (data: string): RoomName => `room-${data}`

type RoomName = string
type IOTDeviceId = string
