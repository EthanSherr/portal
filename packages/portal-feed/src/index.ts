import io from 'socket.io-client'
import { attachFakeFeed } from './attachFakeFeed'

const ROOT = 'https://10.0.0.184'
const PORT = 4000
const CAMERA_ID = `Cam-1`

const main = async () => {

  const url = `${[ROOT, PORT].join(':')}/iot`
  console.log('connecting to url', url)
  const socket = io(url)

  let tearDown = new Array<() => void>()

  socket.on('connect', () => {
    console.log('Connected to the server', socket.id, 'at', url)

    socket.sendBuffer = []
    socket.emit("pi-cam-init", CAMERA_ID)

    console.log('sending fake img')
    tearDown.push(attachFakeFeed(socket, CAMERA_ID))

    // attachNodejsCam(socket, CAMERA_ID) // TODO
  })
  socket.on('disconnect', () => {
    tearDown.forEach(teardownFn => teardownFn())
    tearDown = []
  })
  socket.on('new-consumer', (data) => {
    console.log(data + ' has join the stream');
  });

  socket.on('consumer-left', (data) => {
    console.log(data + ' has left the stream');
  });

  socket.on('connect_error', (err) => {
    console.log('connection_error due to ', err.message)
  })




}
main()