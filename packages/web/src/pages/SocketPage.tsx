import { useEffect, useState } from "react"
import { useSocket } from "../useSocket"
import { ImageTracker, ZapparCamera, ZapparCanvas } from "@zappar/zappar-react-three-fiber"
import { PicturePortal } from "../atoms/PicturePortal"
import { OrbitControls } from "@react-three/drei"

const CAMERA_ID = `Cam-1`

export const SocketPage = () => {
  const [data, setData] = useState<string>()

  const { connected, socket } = useSocket('iot', 'consumer-receive-feed', (data: string) => {
    console.log('data is set', data.length)
    setData(data)
  })

  useEffect(() => {
    if (!connected) return
    socket.emit('consumer-start-viewing', CAMERA_ID)
  }, [connected, socket])

  const [trackerVisible, setTrackerVisible] = useState(true) // TODO remove
  const targetFile = new URL('../assets/example-tracking-image.zpt', import.meta.url).href;

  return <div>
    <span>{`socket ${connected ? 'connected' : 'not connected'}`}</span>
    {data && <img src={data} />}


    <ZapparCanvas style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}>
      {/* <ZapparCamera /> */}
      <OrbitControls />

      <PicturePortal cameraId={'Cam-1'} />
      <ImageTracker
        onNotVisible={() => setTrackerVisible(false)}
        onVisible={() => setTrackerVisible(true)}
        targetImage={targetFile}>
        {<PicturePortal cameraId={'Cam-1'} />}
      </ImageTracker>

      <ambientLight intensity={300} />
    </ZapparCanvas >

  </div>
}