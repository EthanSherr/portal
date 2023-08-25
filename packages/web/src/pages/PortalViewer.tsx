import { FC, useMemo, useRef, useState } from 'react'
import { useSocket } from '../hooks/useSocket'
import { ZapparCamera, ZapparCanvas } from '@zappar/zappar-react-three-fiber'
import { OrbitControls } from '@react-three/drei'
import { VideoElementTexture } from '../atoms/VideoElementTexture'

type RTCHandhsakeState = 'connecting' | 'waiting-for-answer' | 'done'

export const PortalViewer: FC = () => {
  const { connected, socket } = useSocket({ endpoint: 'portal' })
  const [rtchHandshakeState, setRtchHandshakeState] = useState<RTCHandhsakeState>('connecting')

  const peerConnection = useMemo(() => {
    const pc = new RTCPeerConnection()
    pc.ontrack = ({ streams: [stream] }) => {
      const video = remoteVideoRef.current
      if (!video) {
        console.error('unable to set peerConnection track, videoRef is null')
        return
      }
      console.log('ontrack stream', stream)
      video.srcObject = stream!
    }

    return pc
  }, [])


  const createPeerConnection = async () => {
    const offer = await peerConnection.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true })
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer))

    console.log('emit send-offer', offer)
    setRtchHandshakeState('waiting-for-answer')
    socket.emit('send-offer', { offer, to: 'Cam-1' }, async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      console.log('received answer to offer', { answer })
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
    <>
      <div>
        <h1>socket {connected ? 'connected' : 'disconnected'}</h1>
        <h1>rtcHandshakestate {rtchHandshakeState}</h1>
        <button onClick={createPeerConnection}>connect</button>
        <video autoPlay style={{ width: 200, height: 200, backgroundColor: 'blue' }} ref={remoteVideoRef} />
      </div>
      <ZapparCanvas style={{ width: '100%', height: '100%' }}>
        <ZapparCamera />
        <OrbitControls />

        {/* 
        <ImageTracker
          onNotVisible={() => setTrackerVisible(false)}
          onVisible={() => setTrackerVisible(true)}
          targetImage={targetFile}>
          <mesh position={[0, 0, -1]}>
            <planeGeometry args={[0.5, 0.5]} />
            <VideoElementTexture videoRef={remoteVideoRef} />
          </mesh>
        </ImageTracker> 
        */}

        <mesh position={[0, 0, -1]}>
          <planeGeometry args={[0.5, 0.5]} />
          <VideoElementTexture videoRef={remoteVideoRef} />
        </mesh>
      </ZapparCanvas>
    </>
  )
}