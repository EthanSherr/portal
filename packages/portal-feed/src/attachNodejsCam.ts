import { Socket } from "socket.io-client"
import NodeWebcam from 'node-webcam'

export const attachNodejsCam = (socket: Socket, cameraId: string) => {
  const bailRef = { value: false }

  const webcam = NodeWebcam.create({
    frames: 60,
    output: 'jpeg',
    verbose: true,
    height: 1080,
    width: 1920,
    callbackReturn: 'base64',
    quality: 5,
  })

  const doCapture = () => {
    if (bailRef.value) return

    // console.time('capture-time')
    webcam.capture('test_ic', (err, data) => {
      if (err) {
        console.error(err)
        return
      } else {
        // console.timeEnd('capture-time')
        // console.log('data', { err, data })
        console.log('data', data.length)
        socket.emit('pi-video-stream', cameraId, data)
      }
      // doCapture()

    })
  }
  doCapture()


  return () => {
    bailRef.value = true
  }
}