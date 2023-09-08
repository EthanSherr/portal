import { useRef, useState } from 'react'
import { useSocket, useSocketEvent } from '../hooks/useSocket'
import { useUserMedia } from '../hooks/useUserMedia'
import QRCode from 'qrcode'
import { usePortalPeerConnection } from '../hooks/usePortalPeerConnection'

export const PortalFeed = () => {
  const { connected, socket } = useSocket({ endpoint: 'portal' })
  const [stream, setStream] = useState<MediaStream | null>(null)
  useUserMedia((stream) => {
    videoRef.current!.srcObject = stream
    console.log('stream is set!')
    setStream(stream)
  })

  const { ready, createPeerConnection } = usePortalPeerConnection(stream)

  useSocketEvent<{ offer: RTCSessionDescriptionInit, from: string }, RTCSessionDescriptionInit>(socket, {
    eventName: 'get-answer',
    onEventHandler: async ({ offer, from }, callback) => {
      const pc = createPeerConnection(from)

      console.log('get-answer', offer, '\n from', from)
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      callback(answer)
    }
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [inputValue, setInputValue] = useState('')
  const portalUrl = `${window.location.origin}/PortalViewer/${inputValue}`
  const onSubmit = () => {
    socket.emit('register-portal', inputValue)
    QRCode.toDataURL(canvasRef.current!, portalUrl, { scale: 20 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <video autoPlay style={{ width: 200, height: 200, backgroundColor: 'black' }} ref={videoRef} muted />
      <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
      <button onClick={onSubmit}>submit</button>
      <span>/portal socket {connected ? 'connected' : 'disonnected'}</span>
      <span>{portalUrl}</span>
      <canvas ref={canvasRef} />
    </div>
  )
}