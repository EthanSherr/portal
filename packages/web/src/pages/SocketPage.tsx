import { useEffect, useState } from "react"
import { useSocket } from "../useSocket"

const CAMERA_ID = `Cam-1`

export const SocketPage = () => {
  const [data, setData] = useState<string>()

  const { connected, socket } = useSocket('consumer-receive-feed', (data: string) => {
    setData(data)
  })

  useEffect(() => {
    if (!connected) return
    socket.emit('consumer-start-viewing', CAMERA_ID)
  }, [connected, socket])

  return <div>
    <span>{`socket ${connected ? 'connected' : 'not connected'}`}</span>
    {data && <img src={data} />}
  </div>
}