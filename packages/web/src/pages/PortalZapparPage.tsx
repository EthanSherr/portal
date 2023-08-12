import { OrbitControls } from '@react-three/drei'
import { FC, useState } from 'react'
import { Portal } from '../atoms/Portal'
import demoUrl from '../assets/demo.mp4'
import { ImageTracker, ZapparCamera, ZapparCanvas } from '@zappar/zappar-react-three-fiber'

export const PortalZapparPage: FC = () => {
  const targetFile = new URL('../assets/example-tracking-image.zpt', import.meta.url).href;

  const [trackerVisible, setTrackerVisible] = useState(false)


  return (
    <ZapparCanvas style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}>
      <ZapparCamera
        onFirstFrame={() => {
          console.log("first frame");
        }}
      />
      <OrbitControls />
      <ImageTracker
        onNotVisible={() => setTrackerVisible(false)}
        onVisible={() => setTrackerVisible(true)}
        targetImage={targetFile}>
        {/* 
            <mesh position={[0, 0, -5]}>
              <sphereGeometry />
              <meshStandardMaterial color="hotpink" />
            </mesh> 
          */}

        {trackerVisible && <Portal url={demoUrl} />}
      </ImageTracker>

      <directionalLight />
    </ZapparCanvas >
  )
}
