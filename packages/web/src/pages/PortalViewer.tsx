import { FC, useMemo, useRef, useState } from 'react'
import { useSocket } from '../hooks/useSocket'
import { ImageTracker, ZapparCamera, ZapparCanvas } from '@zappar/zappar-react-three-fiber'
import { OrbitControls } from '@react-three/drei'
import { VideoElementTexture } from '../atoms/VideoElementTexture'
import { useParams, useSearchParams } from 'react-router-dom'
import { peerConnectionConfig } from '../helpers/webrtcConfig'

type RTCHandhsakeState = 'connecting' | 'waiting-for-answer' | 'done'

export const PortalViewer: FC = () => {
  const { cameraId } = useParams()
  const [searchParams] = useSearchParams()
  const flatDebug = Boolean(searchParams.get('debug'))

  const [iceState, setIceState] = useState('')
  const [signalingState, setSignalingState] = useState('')
  const [pcConnectionState, setPcConnectionState] = useState('')

  const { connected, socket } = useSocket({
    endpoint: 'portal', onConnected: () => {
      createPeerConnection()
    }
  })
  const [rtchHandshakeState, setRtchHandshakeState] = useState<RTCHandhsakeState>('connecting')

  const peerConnection = useMemo(() => {
    const pc = new RTCPeerConnection(peerConnectionConfig)

    console.log('pc init values')
    setIceState(pc.iceConnectionState)
    setSignalingState(pc.signalingState)
    setPcConnectionState(pc.connectionState)

    pc.ontrack = ({ streams: [stream] }) => {
      const v1 = remoteVideoRef.current
      if (!v1) {
        console.error('unable to set peerConnection track, videoRef is null')
        return
      }
      console.log('pc.ontrack', stream)
      v1.srcObject = stream!
    }

    pc.oniceconnectionstatechange = () => {
      console.log('pc oniceconnectionstatechange', pc.iceConnectionState)
      setIceState(pc.iceConnectionState)
    }

    pc.onsignalingstatechange = () => {
      console.log('pc onsignalingstatechange', pc.signalingState)
      setSignalingState(pc.signalingState)
    }

    pc.onconnectionstatechange = () => {
      console.log('pc onconnectionstatechange', pc.connectionState)
      setPcConnectionState(pc.connectionState)
    }

    return pc
  }, [])

  const repeatRef = useRef(true)
  const createPeerConnection = async () => {
    console.log("================createPeerConnection==============")
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
        createPeerConnection()
      }
    })
  }

  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // const targetFile = new URL('../assets/example-tracking-image.zpt', import.meta.url).href
  // const targetFile = new URL('../assets/logo.png.zpt', import.meta.url).href
  // const targetFile = new URL('../assets/cam-1.png.zpt', import.meta.url).href
  const targetFile = new URL('../assets/paperwindowsonlinecam1.png.zpt', import.meta.url).href

  const [trackerVisible, setTrackerVisible] = useState(false)
  const hideArView = false

  return (
    <>
      <div>
        {flatDebug && <>
          <pre>{JSON.stringify({
            cameraId,
            socketIsConnected: connected,
            rtchHandshakeState,
            pcConnectionState,
            iceState,
            signalingState
          }, null, 2)}</pre>
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
        {!trackerVisible && <h1>Aim your camera at the qr code</h1>}
        {/* <button onClick={createPeerConnection}>reconnect video</button> */}
      </div>}
      {!hideArView &&
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
      }

    </>
  )
}