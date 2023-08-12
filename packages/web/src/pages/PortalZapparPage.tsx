import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC } from 'react'
import { Portal } from '../atoms/Portal'
import demoUrl from '../assets/demo.mp4'
import { BrowserCompatibility, ZapparCamera, ZapparCanvas, browserIncompatible } from '@zappar/zappar-react-three-fiber'

export const PortalZapparPage: FC = () => {
  const targetFile = "example-tracking-image.zpt";

  console.log('browserIncompatible()', browserIncompatible())

  return (
    <>
      <ZapparCanvas style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}>

        {/* <ImageTracker targetImage={targetFile}> */}
        <ZapparCamera userFacing />
        {/* <ZapparCamera
          onFirstFrame={() => {
            console.log("first frame");
          }}
        /> */}
        <Portal url={demoUrl} />
        {/* </ImageTracker> */}

        <directionalLight />
      </ZapparCanvas >
      {/* <video controls={true} autoPlay={true} style={{ width: '100%', height: '100%', backgroundColor: 'black' }} src={demoUrl}></video> */}
    </>
  )
}
