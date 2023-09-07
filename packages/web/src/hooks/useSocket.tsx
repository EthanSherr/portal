import { useEffect, useRef, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import { usePassthroughRef } from './usePassthroughRef'

const SOCKET_ROOT = window.location.origin.replace(':3000', ':4000') //.replace('https', 'http')

console.log('debug SOCKET_ROOT', SOCKET_ROOT)

const sockets = new Map<string, Socket>()

const getSocket = (endpoint: string) => {
  const url = `${SOCKET_ROOT}/${endpoint}`
  let socket = sockets.get(url)
  if (!socket) {
    sockets.set(url, socket = io(url, {
      // transports: ['websocket'],
      reconnection: true,
      rejectUnauthorized: false
    }))
  }
  return socket
}

export type UseSocketParams = {
  endpoint: string // like 'iot' will go to ROOT_URL + '/' + iot
  onConnected?: () => void
  onDisconnected?: () => void
}

export type UseSocketResult = {
  connected: boolean,
  socket: Socket
}

export const useSocket = ({ endpoint, ...paramsRest }: UseSocketParams): UseSocketResult => {
  const socket = getSocket(endpoint)

  const [connected, setConnected] = useState(socket.connected ?? false)
  const connectionCallbackRef = usePassthroughRef(paramsRest)

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true)
      connectionCallbackRef.current.onConnected?.()
    }

    const handleDisconnect = () => {
      setConnected(false)
      connectionCallbackRef.current.onDisconnected?.()
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [])

  return { connected, socket }
}

export type SocketEventParams<T, R> = {
  eventName: string,
  onEventHandler: (response: T, callback: (response: R) => void) => void | Promise<void>
}

export const useSocketEvent = <T, R,>(socket: Socket, { eventName, onEventHandler }: SocketEventParams<T, R>) => {

  const onEventHandlerRef = usePassthroughRef(onEventHandler)

  useEffect(() => {
    const handler = onEventHandlerRef.current
    socket.on(eventName, handler)
    return () => {
      socket.off(eventName, handler)
    }
  }, [socket, eventName])
}
