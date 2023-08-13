import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

// TODO better socket management & teardown?
const url = `http://localhost:4000/iot`
const socket = io(url)

export const useSocket = <Response,>(
  eventName: string,
  handleCustomEvent: (event: Response) => void
) => {
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
