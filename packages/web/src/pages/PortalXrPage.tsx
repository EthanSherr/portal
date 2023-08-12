import { OrbitControls } from '@react-three/drei'
import { XR, ARButton } from '@react-three/xr'
import { Canvas } from '@react-three/fiber'
import { FC } from 'react'
import { Portal } from '../atoms/Portal'
import demoUrl from '../assets/demo.mp4'
import { CameraVideo } from '../atoms/CameraVideo'

export const PortalXrPage: FC = () => {

  return (
    <>
      {/* <ARButton /> */}

      <ARButton />
      <Canvas style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}>

        <XR>
          <OrbitControls />
          <Portal url={demoUrl} />
        </XR>
      </Canvas>
      {/* <video controls={true} autoPlay={true} style={{ width: '100%', height: '100%', backgroundColor: 'black' }} src={demoUrl}></video> */}
    </>
  )
}
