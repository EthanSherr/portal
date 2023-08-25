import { FC, useRef, useState } from 'react'
import { useSocket, useSocketEvent } from '../hooks/useSocket'
import { useAsyncEffect } from '../hooks/useAsyncEffect'


type RTCHandhsakeState = 'connecting' | 'waiting-for-answer' | 'done'

export const PortalViewer: FC = () => {
  const { connected, socket } = useSocket({ endpoint: 'portal' })
  const peerConnectionRef = useRef<RTCPeerConnection>()
  const [rtchHandshakeState, setRtchHandshakeState] = useState<RTCHandhsakeState>('connecting')


  const createPeerConnection = async () => {

    peerConnectionRef.current = new RTCPeerConnection()
    const peerConnection = peerConnectionRef.current

    peerConnection.ontrack = ({ streams: [stream] }) => {
      const video = remoteVideoRef.current
      if (!video) {
        console.error('unable to set peerConnection track, videoRef is null')
        return
      }
      console.log('ontrack stream', stream)
      video.srcObject = stream!
      video.play()
    }

    const offer = await peerConnection.createOffer()
    // await peerConnection.setLocalDescription(new RTCSessionDescription(offer))
    await peerConnection.setLocalDescription(offer)
    console.log('emit send-offer')

    setRtchHandshakeState('waiting-for-answer')
    socket.emit('send-offer', { offer, to: 'Cam-1' }, async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      console.log('callback!')
      console.log('received answer to offer', answer)
      const peerConnection = peerConnectionRef.current
      if (!peerConnection) {
        console.error("peerConnection undefined on received send-answer, bailing")
        return
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))

      setRtchHandshakeState('done')
    })
  }

  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  return (
    <div>
      <h1>socket {connected ? 'connected' : 'disconnected'}</h1>
      <h1>rtcHandshakestate {rtchHandshakeState}</h1>
      <button onClick={createPeerConnection}>connect</button>
      <video autoPlay style={{ width: 200, height: 200, backgroundColor: 'blue' }} ref={remoteVideoRef} />
    </div>)
}