import { useRef, useState } from 'react'
import QRCode from 'qrcode'
import notificationSound from '../assets/notification.mp3'
import useSound from 'use-sound'
import { useSocket, useSocketEvent } from '../hooks/useSocket'
import { useUserMedia } from '../hooks/useUserMedia'

import { usePortalPeerConnection } from '../hooks/usePortalPeerConnection'

export const PortalFeed = () => {
  const { connected, socket } = useSocket({ endpoint: 'portal' })

  const [stream, setStream] = useState<MediaStream | null>(null)
  useUserMedia((stream) => setStream(videoRef.current!.srcObject = stream))

  const { ready, createPeerConnection } = usePortalPeerConnection(stream)

  // answer the incoming connection
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

  // add & remove viewers
  const [viewers, setViewers] = useState(new Array<string>())
  const [playNotification] = useSound(notificationSound)
  useSocketEvent<{ viewers: Array<string> }, void>(socket, {
    eventName: 'add-viewers',
    onEventHandler: ({ viewers: newViewers }) => {
      if (newViewers.some(v => !viewers.includes(v))) {
        playNotification()
      }
      setViewers([...new Set([...viewers, ...newViewers])])
    }
  })

  useSocketEvent<{ viewers: Array<string> }, void>(socket, {
    eventName: 'remove-viewers',
    onEventHandler: ({ viewers: removeViewers }) => setViewers(viewers.filter(viewer => !removeViewers.includes(viewer)))
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [inputValue, setInputValue] = useState('Cam-1')
  const [domainOverrideValue, setDomainOverrideValue] = useState('https://paperwindows.online')
  const portalUrl = `${domainOverrideValue || window.location.origin}/PortalViewer/${inputValue}`
  const onSubmit = () => {
    socket.emit('register-portal', inputValue)
    QRCode.toDataURL(canvasRef.current!, portalUrl, { scale: 20 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <video autoPlay style={{ width: 200, height: 200, backgroundColor: 'black' }} ref={videoRef} muted />
          <div>
            <label id='camera-id-label'>CameraID Label</label>
            <input aria-labelledby='camera-id-label' value={inputValue} onChange={e => setInputValue(e.target.value)} />
          </div>
          <div>
            <label id='domain-override-label'>Domain Override Label</label>
            <input aria-labelledby='domain-override-label' value={domainOverrideValue} onChange={e => setDomainOverrideValue(e.target.value)} />
          </div>
          <button onClick={onSubmit}>submit</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3>Viewers</h3>
          <ul>
            {viewers.map(viewer => <li key={viewer}>{viewer}</li>)}
          </ul>
        </div>
      </div>
      <span>/portal socket {connected ? 'connected' : 'disonnected'}</span>
      <a href={portalUrl}>{portalUrl}</a>
      <canvas ref={canvasRef} />

    </div >
  )
}