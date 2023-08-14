import { useEffect, useRef, useState } from 'react'
import { Socket, io } from 'socket.io-client'

// TODO better socket management & teardown?
// const url = `http://10.0.0.184:4000/iot`
const url = window.location.origin.replace(':3000', ':4000').replace('https', 'https') + '/iot'

console.log('url', url)
const socket: Socket = io(url)

export const useSocket = <Response,>(
  eventName: string,
  handleCustomEvent: (event: Response) => void
): {
  connected: boolean,
  socket: Socket
} => {
  const [connected, setConnected] = useState(socket.connected)

  const handleCustomEventRef = useRef(handleCustomEvent)
  handleCustomEventRef.current = handleCustomEvent

  useEffect(() => {
    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)

    const _handleCustomEvent = handleCustomEventRef.current

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on(eventName, _handleCustomEvent)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off(eventName, _handleCustomEvent)
    }
  }, [eventName, setConnected, handleCustomEventRef])

  return { connected, socket }
}
