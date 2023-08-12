import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { } from '@react-three/drei'
import { FC } from 'react'
import { Portal } from '../atoms/Portal'
import demoUrl from '../assets/demo.mp4'
import { CameraVideo } from '../atoms/CameraVideo'

export const PortalCamPage: FC = () => {

  return (
    <>
      <div style={{ position: 'absolute', zIndex: 0, width: '100%', height: '100%' }}>
        <CameraVideo />
      </div>
      <Canvas style={{ width: '100%', height: '100%', backgroundColor: 'blue' }}>
        <OrbitControls />
        <Portal url={demoUrl} />
      </Canvas>
      {/* <video controls={true} autoPlay={true} style={{ width: '100%', height: '100%', backgroundColor: 'black' }} src={demoUrl}></video> */}
    </>
  )
}
