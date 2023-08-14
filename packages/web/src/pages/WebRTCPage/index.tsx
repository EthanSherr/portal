import { FC, useEffect, useRef } from "react"
import { useUserMedia } from "./useUserMedia"
import { useSocket } from "../../useSocket"

export const WebRTCPage: FC = () => {

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useUserMedia((stream) => {
    const video = localVideoRef.current
    if (!video) {
      console.error('localVideoRef was null, unable to show local video')
      return
    }
    console.log('stream', stream)
    video.srcObject = stream
  })

  const { connected, socket } = useSocket('webrtc', 'x', () => {
    console.log('x happened')
  })

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
          <h3 className="panel-title">Active Users:</h3>
        </div>
        <div className="video-chat-container">
          <h2 className="talk-info" id="talking-with-info">
            Select active user on the left menu.
          </h2>
          <div className="video-container">
            <video autoPlay className="remote-video" id="remote-video"></video>
            <video autoPlay muted className="local-video" id="local-video" ref={localVideoRef} />
          </div>
        </div>
      </div>
    </div>
  )
}