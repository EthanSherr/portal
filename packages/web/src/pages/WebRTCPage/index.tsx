import { FC, RefObject, useEffect, useMemo, useRef, useState } from "react"
import { useUserMedia } from "./useUserMedia"
import { useSocket, useSocketEvent } from "../../hooks/useSocket"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { VideoTexture } from "three"

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

  return (
    <div className="container">
      <header className="header">
        <div className="logo-container">
          <img src="./img/doge.png" alt="doge logo" className="logo-img" />
          <h1 className="logo-text">
            Socket {connected ? 'connected' : 'disconnected'}
          </h1>
        </div>
      </header>
      <div className="content-container">
        <div className="active-users-panel" id="active-user-container">
          <h3 className="panel-title">Active Users:
            <ul>
              {
                sockets.map(socket =>
                  <li key={socket}>
                    <button onClick={() => callUser(socket)}>{socket}</button>
                  </li>
                )
              }
            </ul>
          </h3>
        </div>
        <div className="video-chat-container">
          <h2 className="talk-info" id="talking-with-info">
            Select active user on the left menu.
          </h2>
          <div className="video-container">
            <video autoPlay className="remote-video" id="remote-video" ref={remoteVideoRef} style={{ backgroundColor: 'blue' }} />
            <video autoPlay muted className="local-video" id="local-video" ref={localVideoRef} style={{ backgroundColor: 'red' }} />
          </div>
        </div>
      </div>
      <Canvas style={{ width: '100%', height: '100%' }}>
        <OrbitControls />
        <mesh>
          <planeGeometry args={[2, 2]} />
          <VideoElementTexture videoRef={localVideoRef} />
        </mesh>
        <ambientLight intensity={300} />
      </Canvas>
    </div>
  )
}

const VideoElementTexture = ({ videoRef }: { videoRef: RefObject<HTMLVideoElement> }) => {
  const texture = useMemo(() =>
    new VideoTexture(videoRef.current!)
    , [])

  return <meshBasicMaterial map={texture} toneMapped={false} />
}