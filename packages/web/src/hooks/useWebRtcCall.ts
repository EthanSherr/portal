import { useRef } from "react"
import { useSocket, useSocketEvent } from "./useSocket"

type Mode = 'portal' | 'viewer'

export const useWebrtcConnection = () => {
  const { socket } = useSocket({ endpoint: 'portal' })
  const peerConnectionRef = useRef<RTCPeerConnection>()

  const createPeerConnection = async () => {

    peerConnectionRef.current = new RTCPeerConnection()
    const peerConnection = peerConnectionRef.current

    // peerConnection.ontrack = ({ streams: [stream] }) => {
    //   const video = remoteVideoRef.current
    //   if (!video) {
    //     console.error('unable to set peerConnection track, videoRef is null')
    //     return
    //   }
    //   console.log('ontrack stream', stream)
    //   video.srcObject = stream!
    //   video.play()
    // }

    const offer = await peerConnection.createOffer()
    // await peerConnection.setLocalDescription(new RTCSessionDescription(offer))
    await peerConnection.setLocalDescription(offer)
    console.log('emit ask-for-portal-session')

    socket.emit('ask-for-portal-session', { offer, to: 'Cam-1' })
  }

  useSocketEvent(socket, {
    eventName: 'finish-portal-session',
    onEventHandler: async ({ answer }: { from: string, answer: RTCSessionDescriptionInit }) => {
      console.log('received finish-portal-session')
      const peerConnection = peerConnectionRef.current
      if (!peerConnection) {
        console.error("peerConnection undefined on received finish-portal-session, bailing")
        return
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    }
  })

  //
  useSocketEvent(socket, {
    eventName: 'get-portal-session',
    onEventHandler: async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
      console.log('portal received get-portal-session', { offer, from })
      // peerConnection.onicecandidate = async ({ candidate }) => {
      //   console.log('on ice candidate', candidate)
      // }

      const peerConnection = peerConnectionRef.current!

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      socket.emit('on-portal-session', { answer, to: from })
    }
  })


}