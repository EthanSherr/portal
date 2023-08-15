import { useEffect, useRef, useState } from 'react'
import { Socket, io } from 'socket.io-client'

const SOCKET_ROOT = window.location.origin.replace(':3000', ':4000').replace('https', 'http')

const sockets = new Map<string, Socket>()

const getSocket = (endpoint: string) => {
  const url = `${SOCKET_ROOT}/${endpoint}`
  let socket = sockets.get(url)
  if (!socket) {
    sockets.set(url, socket = io(url, {
      transports: ['websocket'],
      rejectUnauthorized: false
    }))
  }
  return socket
}

export const useSocketOld = <Response,>(
  endpoint: string,
  eventName: string,
  handleCustomEvent: (event: Response) => void
): {
  connected: boolean,
  socket: Socket
} => {
  const socket = getSocket(endpoint)

  const [connected, setConnected] = useState(socket.connected ?? false)

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
