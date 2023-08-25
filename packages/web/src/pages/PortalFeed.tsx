import { FC, useEffect, useMemo, useRef } from 'react'
import { useSocket, useSocketEvent } from '../hooks/useSocket'
import { useUserMedia } from '../hooks/useUserMedia'

export const PortalFeed = () => {
  const { connected, socket } = useSocket({ endpoint: 'portal' })
  const peerConnection = useMemo(() => new RTCPeerConnection(), [])

  useEffect(() => {
    peerConnection.onconnectionstatechange = () => {
      console.log('connection state change', peerConnection.connectionState)
    }
  }, [])

  const oneTime = useRef(false)

  useEffect(() => {
    if (!connected) return
    if (oneTime.current) return

    oneTime.current = true
    console.log('emit register-portal')
    socket.emit('register-portal', 'Cam-1')
  }, [connected, socket])

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
      console.log('portal received offer', { offer, from })

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      callback(answer)
    }
  })


  const videoRef = useRef<HTMLVideoElement>(null)

  return <div> /portal socket {connected ? 'connected' : 'disonnected'}
    <video autoPlay style={{ width: 200, height: 200, backgroundColor: 'black' }} ref={videoRef} muted></video>
  </div>
}