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
      // createPeerConnection()
    }
  })
  const [rtchHandshakeState, setRtchHandshakeState] = useState<RTCHandhsakeState>('connecting')

  const peerConnection = useMemo(() => {
    const pc = new RTCPeerConnection()
    pc.ontrack = ({ streams: [stream] }) => {
      const v1 = remoteVideoRef.current
      if (!v1) {
        console.error('unable to set peerConnection track, videoRef is null')
        return
      }
      console.log('pc.ontrack', stream)
      v1.srcObject = stream!

    }

    return pc
  }, [])

  const repeatRef = useRef(true)
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

      // must be called twice? Perhaps the feed's remote must be set after the viewer's local?
      if (repeatRef.current) {
        repeatRef.current = false
        setTimeout(async () => {
          createPeerConnection()
        }, 1000)
      }
    })
  }

  // const flatRemoteVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // const targetFile = new URL('../assets/example-tracking-image.zpt', import.meta.url).href
  // const targetFile = new URL('../assets/logo.png.zpt', import.meta.url).href
  // const targetFile = new URL('../assets/cam-1.png.zpt', import.meta.url).href
  const targetFile = new URL('../assets/paperwindowsonlinecam1.png.zpt', import.meta.url).href


  const [trackerVisible, setTrackerVisible] = useState(false)

  const flatDebug = true

  return (
    <>
      <div>
        {flatDebug && <>
          <h3>cameraId: {cameraId}</h3>
          <h3>socket {connected ? 'connected' : 'disconnected'}</h3>
          <h3>rtcHandshakestate {rtchHandshakeState}</h3>
          <button onClick={createPeerConnection}>connect</button>
        </>}
        <video autoPlay style={{
          width: 200,
          height: 200,
          backgroundColor: 'blue',
          opacity: flatDebug ? 1 : 0,
          position: flatDebug ? 'inherit' : 'absolute'
        }} ref={remoteVideoRef} />
      </div>
      {<div style={{ position: 'absolute', zIndex: 1, color: 'white' }}>
        <h1>Cam: {cameraId}</h1>
        <h1>Status: {rtchHandshakeState}</h1>
        <h1>trackerVisible: {trackerVisible ? 'yes' : 'no, aim at qr code'}</h1>
        <button onClick={createPeerConnection}>reconnect video</button>
      </div>}
      <ZapparCanvas style={{ width: '100%', height: '100%' }}>
        <ZapparCamera />
        <OrbitControls />
        <ImageTracker
          onNotVisible={() => setTrackerVisible(false)}
          onVisible={() => setTrackerVisible(true)}
          targetImage={targetFile}>
          {trackerVisible && <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2, 2]} />
            <VideoElementTexture videoRef={remoteVideoRef} />
          </mesh>}
        </ImageTracker>
      </ZapparCanvas>
    </>
  )
}