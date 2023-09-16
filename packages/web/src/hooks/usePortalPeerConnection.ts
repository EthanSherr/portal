import { useMemo } from "react"
import { peerConnectionConfig } from "../helpers/webrtcConfig"


export const usePortalPeerConnection = (stream: MediaStream | null) => {

  const peerConnectionsFrom = useMemo(() => new Map<string, RTCPeerConnection>(), [])

  return {
    ready: Boolean(stream),
    createPeerConnection: (from: string) => {
      console.log('createPeerConnection', from, ' stream', Boolean(stream))
      let pc = peerConnectionsFrom.get(from)
      if (pc) {
        console.error(`createPeerConnection("${from}"): peerConnection already exists`)
      } else {
        peerConnectionsFrom.set(from, pc = new RTCPeerConnection(peerConnectionConfig))
        stream?.getTracks()?.forEach(track => pc!.addTrack(track, stream))
      }
      console.log('peer connections', peerConnectionsFrom)
      return pc
    },
    destroyPeerConnection: () => {
      // todo
    }
  }

}