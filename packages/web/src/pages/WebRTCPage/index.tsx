import { FC, RefObject, useEffect, useMemo, useRef, useState } from "react"
import { useUserMedia } from "../../hooks/useUserMedia"
import { useSocket, useSocketEvent } from "../../hooks/useSocket"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { VideoTexture } from "three"
import { ImageTracker, ZapparCamera, ZapparCanvas } from "@zappar/zappar-react-three-fiber"

export const WebRTCPage: FC = () => {
  const [sockets, setSockets] = useState(new Array<string>())

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const peerConnection = useMemo(() => new RTCPeerConnection(), [])

  useEffect(() => {
    peerConnection.ontrack = ({ streams: [stream] }) => {
      const video = remoteVideoRef.current
      if (!video) {
        console.error('unable to set peerConnection track, videoRef is null')
        return
      }
      console.log('ontrack stream', stream)
      video.srcObject = stream!
    }
  }, [peerConnection])

  useUserMedia((stream) => {
    const video = localVideoRef.current
    if (!video) {
      console.error('localVideoRef was null, unable to show local video')
      return
    }
    video.srcObject = stream
    setReadyToMount(true)
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream))
  })


  const { connected, socket } = useSocket({ endpoint: 'webrtc' })

  useSocketEvent<{ users: Array<string> }>(socket, {
    eventName: 'update-user-list',
    onEventHandler: (data) => {
      setSockets(users => [...users, ...data.users])
    }
  })

  useSocketEvent(socket, {
    eventName: 'remove-user',
    onEventHandler: (removedUser: string) => setSockets(users => users.filter(user => removedUser != user))
  })

  useSocketEvent(socket, {
    eventName: 'call-made',
    onEventHandler: async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
      console.log('call-made')
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

      socket.emit("make-answer", {
        answer,
        to: from
      })
    }
  })

  const isAlreadyCallingRef = useRef(false)
  useSocketEvent(socket, {
    eventName: 'answer-made',
    onEventHandler: async ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
      console.log('answer-made')
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      if (!isAlreadyCallingRef.current) {
        callUser(from)
        isAlreadyCallingRef.current = true
      }
    }
  })


  const callUser = async (socketId: string) => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    socket.emit("call-user", {
      offer,
      to: socketId
    })
  }

  const [trackerVisible, setTrackerVisible] = useState(true)
  const [readyToMount, setReadyToMount] = useState(false)

  const targetFile = new URL('../../assets/example-tracking-image.zpt', import.meta.url).href


  return (
    <>
      <span>connected {connected ? 'true' : 'false'}</span><br />
      <span>ready to mount {readyToMount ? 'true' : 'false'}</span>
      {<div style={{ position: 'absolute', zIndex: 1, width: '100%', backgroundColor: 'red' }}>
        <div>
          <h3>Active Users:</h3>
          <ul>
            {sockets.map(socket =>
              <li key={socket}>
                <button onClick={() => callUser(socket)}>{socket}</button>
              </li>
            )}
          </ul>
        </div>
        <div style={{ opacity: 0.3, position: 'absolute', zIndex: -1 }}>
          <video autoPlay muted ref={localVideoRef} style={{ width: 100, height: 100 }} />
          <video autoPlay ref={remoteVideoRef} style={{ width: 100, height: 100 }} />
        </div>
      </div>}
      <ZapparCanvas style={{ width: '100%', height: '100%' }}>
        <ZapparCamera />
        <OrbitControls />

        <ImageTracker
          onNotVisible={() => setTrackerVisible(false)}
          onVisible={() => setTrackerVisible(true)}
          targetImage={targetFile}>
          <mesh position={[0, 0, -1]}>
            <planeGeometry args={[0.5, 0.5]} />
            {/* <meshBasicMaterial color={'red'} /> */}
            <VideoElementTexture videoRef={remoteVideoRef} />
          </mesh>
        </ImageTracker>
      </ZapparCanvas>
    </>
  )
}

const VideoElementTexture = ({ videoRef }: { videoRef: RefObject<HTMLVideoElement> }) => {
  const texture = useMemo(() =>
    new VideoTexture(videoRef.current!)
    , [])

  return <meshBasicMaterial map={texture} toneMapped={false} />
}