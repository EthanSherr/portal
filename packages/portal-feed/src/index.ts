import io, { Socket } from 'socket.io-client'
import { StreamCamera, Codec, Flip, SensorMode } from 'pi-camera-connect'
import { sendFakeImg } from './fakeSendImg'
import { attachNodejsCam } from './attachNodejsCam'

const ROOT = 'http://10.0.0.184'
const PORT = 4000
const CAMERA_ID = `Cam-1`

const main = async () => {

  const url = `${[ROOT, PORT].join(':')}/iot`
  const socket = io(url)

  socket.on('connect', () => {
    console.log('Connected to the server', socket.id, 'at', url)

    socket.sendBuffer = []
    socket.emit("pi-cam-init", CAMERA_ID)

    console.log('sending fake img')
    sendFakeImg(socket, CAMERA_ID)
    // attachNodejsCam(socket, CAMERA_ID) // TODO
  })
  socket.on('new-consumer', (data) => {
    console.log(data + ' has join the stream');
  });

  socket.on('consumer-left', (data) => {
    console.log(data + ' has left the stream');
  });




}
main()