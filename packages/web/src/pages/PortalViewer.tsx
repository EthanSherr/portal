import { FC, useMemo, useRef, useState } from 'react'
import { useSocket } from '../hooks/useSocket'
import { ImageTracker, ZapparCamera, ZapparCanvas } from '@zappar/zappar-react-three-fiber'
import { OrbitControls } from '@react-three/drei'
import { VideoElementTexture } from '../atoms/VideoElementTexture'
import { useParams } from 'react-router-dom'

type RTCHandhsakeState = 'connecting' | 'waiting-for-answer' | 'done'

export const PortalViewer: FC = () => {
  const { cameraId } = useParams()

  const { connected, socket } = useSocket({
    endpoint: 'portal', onConnected: () => {
      doAgainRef.current = true
      createPeerConnection()
    }
  })
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

  const doAgainRef = useRef(true)

  const createPeerConnection = async () => {
    const offer = await peerConnection.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true })
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer))

    console.log('emit send-offer', offer)
    setRtchHandshakeState('waiting-for-answer')
    socket.emit('send-offer', { offer, to: cameraId }, async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      console.log('received answer to offer', { answer })
      if (!peerConnection) {
        console.error("peerConnection undefined on received send-answer, bailing")
        return
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))


      setRtchHandshakeState('done')


      if (doAgainRef.current) {
        doAgainRef.current = false
        // createPeerConnection()
      }
    })
  }

  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // const targetFile = new URL('../assets/example-tracking-image.zpt', import.meta.url).href
  // const targetFile = new URL('../assets/logo.png.zpt', import.meta.url).href
  const targetFile = new URL('../assets/cam-1.png.zpt', import.meta.url).href

  const [trackerVisible, setTrackerVisible] = useState(false)

  return (
    <>
      <div>
        <h3>cameraId: {cameraId}</h3>
        <h3>socket {connected ? 'connected' : 'disconnected'}</h3>
        <h3>rtcHandshakestate {rtchHandshakeState}</h3>
        <button onClick={createPeerConnection}>connect</button>
        <video autoPlay style={{ width: 200, height: 200, backgroundColor: 'blue' }} ref={remoteVideoRef} />
      </div>
      <ZapparCanvas style={{ width: '100%', height: '100%' }}>
        <ZapparCamera />
        <OrbitControls />


        <ImageTracker
          onNotVisible={() => setTrackerVisible(false)}
          onVisible={() => setTrackerVisible(true)}
          targetImage={targetFile}>
          {trackerVisible && <mesh position={[0, 0, -1]}>
            <planeGeometry args={[2, 2]} />
            <VideoElementTexture videoRef={remoteVideoRef} />
          </mesh>}
        </ImageTracker>


        {/* <mesh position={[0, 0, -1]}>
          <planeGeometry args={[0.5, 0.5]} />
          <VideoElementTexture videoRef={remoteVideoRef} />
        </mesh> */}
      </ZapparCanvas>
    </>
  )
}