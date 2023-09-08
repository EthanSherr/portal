

export const usePortalPeerConnection = (stream: MediaStream | null) => {

  const peerConnectionsFrom = new Map<string, RTCPeerConnection>()

  return {
    ready: Boolean(stream),
    createPeerConnection: (from: string) => {
      console.log('createPeerConnection', from, ' stream', Boolean(stream))
      let pc = peerConnectionsFrom.get(from)
      if (pc) {
        console.error(`createPeerConnection("${from}"): peerConnection already exists`)
      } else {
        peerConnectionsFrom.set(from, pc = new RTCPeerConnection())
        stream?.getTracks()?.forEach(track => pc!.addTrack(track, stream))
      }
      return pc
    },
    destroyPeerConnection: () => {
      // todo
    }
  }

}