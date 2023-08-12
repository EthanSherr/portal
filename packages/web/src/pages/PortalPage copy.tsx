import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC } from 'react'
import { Portal } from '../atoms/Portal'
import demoUrl from '../assets/demo.mp4'

export const PortalPage: FC = () => {

  return (
    <>
      <Canvas style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}>

        <OrbitControls />
        <Portal url={demoUrl} />

      </Canvas>
      {/* <video controls={true} autoPlay={true} style={{ width: '100%', height: '100%', backgroundColor: 'black' }} src={demoUrl}></video> */}
    </>
  )
}
