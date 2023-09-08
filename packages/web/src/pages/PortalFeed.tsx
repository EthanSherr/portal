import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useSocket, useSocketEvent } from '../hooks/useSocket'
import { useUserMedia } from '../hooks/useUserMedia'
import QRCode from 'qrcode'

export const PortalFeed = () => {
  const { connected, socket } = useSocket({ endpoint: 'portal' })
  const peerConnection = useMemo(() => new RTCPeerConnection(), [])

  useEffect(() => {
    peerConnection.onconnectionstatechange = () => {
      console.log('connection state change', peerConnection.connectionState)
    }
  }, [])

  const tracksadded = useRef(false)
  useUserMedia((stream) => {
    if (tracksadded.current) return
    tracksadded.current = true
    console.log("added tracks!")
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream))
    videoRef.current!.srcObject = stream
  })

  useSocketEvent<{ offer: RTCSessionDescriptionInit, from: string }, RTCSessionDescriptionInit>(socket, {
    eventName: 'get-answer',
    onEventHandler: async ({ offer, from }, callback) => {
      console.log('get-answer', offer, '\n from', from)

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <video autoPlay style={{ width: 200, height: 200, backgroundColor: 'black' }} ref={videoRef} muted />
      <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
      <button onClick={onSubmit}>submit</button>
      <span>/portal socket {connected ? 'connected' : 'disonnected'}</span>
      <span>{portalUrl}</span>
      <canvas ref={canvasRef} style={{ width: '500px', height: '500px', backgroundColor: 'blue' }}></canvas>
    </div>
  )
}