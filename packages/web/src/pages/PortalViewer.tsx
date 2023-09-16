import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSocket } from '../hooks/useSocket'
import { ImageTracker, ZapparCamera, ZapparCanvas } from '@zappar/zappar-react-three-fiber'
import { OrbitControls } from '@react-three/drei'
import { VideoElementTexture } from '../atoms/VideoElementTexture'
import { useParams, useSearchParams } from 'react-router-dom'
import { peerConnectionConfig } from '../helpers/webrtcConfig'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

type RTCHandhsakeState = 'new' | 'connecting' | 'waiting-for-answer' | 'done'

const PortalViewer: FC = () => {

  console.log('NODE_ENV', process.env.NODE_ENV)
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
  const [rtchHandshakeState, setRtchHandshakeState] = useState<RTCHandhsakeState>('new')

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
    setRtchHandshakeState('connecting')
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

const begging = [
  'Come on... Ethan wants you to check it out',
  'Really? you won\'t?',
  'Come on please?',
  `I'm not doing anything evil, just wanna show you a cool AR display!`,
  'Come on, I built this for you...!',
  'Aww man, I really want to show it to you it is super cool :)',
  `pff fine, I dont want you to see it.`,
  'Off with yee!',
  `ok - now you're just messing up my analytics`,
  'Quit it!',
  'ok we are done here...',
  'OOO almost got you there! Lol...',
  'Ok... bye now.'
]

export const PortalViewerWrapper: FC = () => {
  const { hasPermission, getPermission } = useHasPermissions()
  const [beggingIndex, setBeggingIndex] = useState(0)



  if (hasPermission !== 'granted') {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignContent: 'center', color: 'white', textAlign: 'center' }}>
        {hasPermission === 'notgranted' && <div>
          <h1>Welcome </h1>
          <h2>to ethan's portal project</h2>
          <p style={{ padding: 16 }}>I'm going to need access to your video in order to show you a cool AR thing... </p>
          {begging.slice(0, beggingIndex).map(b => <p key={b}>{b}</p>)}
          <div style={{ display: 'flex', flexDirection: beggingIndex > 10 ? 'row' : 'row-reverse', justifyContent: 'center', padding: 16, gap: 8 }}>
            <button style={{ height: 44, borderRadius: 8, padding: 8, minWidth: 60 }} onClick={() => setBeggingIndex(i => i + 1)}>no way</button>
            <button style={{ height: 44, borderRadius: 8, padding: 8, minWidth: 60 }} onClick={getPermission}>ok</button>
          </div>
        </div>}
      </div>
    )
  }

  return <PortalViewer />
}

const useHasPermissions = () => {
  const [hasPermission, setHasPermission] = useState<'granted' | 'notgranted' | 'unknown'>()

  const checkPermission = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      console.log(devices)
      const audioInputDevices = devices.filter(({ kind, deviceId }) => kind === 'audioinput' && deviceId)
      const videoInputDevices = devices.filter(({ kind, deviceId }) => kind === 'videoinput' && deviceId)
      if (audioInputDevices.length > 0 && videoInputDevices.length > 0) {
        setHasPermission('granted')
      } else {
        setHasPermission('notgranted')
      }

    } catch (error) {
      setHasPermission('notgranted')
    }
  }, [setHasPermission])

  const getPermission = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
    setHasPermission('granted')
    stream.getTracks().forEach((track) => track.stop()) // Release the stream when done
  }, [checkPermission])

  useEffect(() => {
    checkPermission()
  }, [])

  return { hasPermission, getPermission }
}