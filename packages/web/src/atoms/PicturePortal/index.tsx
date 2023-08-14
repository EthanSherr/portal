import { FC, Suspense, useEffect, useState } from 'react'
// import {  } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useSocket } from '../../useSocket'
import { TextureLoader } from 'three'

export type PicturePortalProps = {
  cameraId: string
}

export const PicturePortal: FC<PicturePortalProps> = ({ cameraId }) => {
  return (
    <mesh position={[0, 0, 0]} >
      <planeGeometry args={[3, 3]} />
      <VideoMaterial cameraId={cameraId} />
    </mesh>
  )
}

export const VideoMaterial: FC<{ cameraId: string }> = ({ cameraId }) => {
  const [data, setData] = useState<string>()

  const { connected, socket } = useSocket('consumer-receive-feed', (data: string) => {
    console.log('received data', data.length)
    setData(data)
  })

  useEffect(() => {
    if (!connected) return
    socket.emit('consumer-start-viewing', cameraId)
  }, [connected, socket])

  if (!data) {
    return <meshBasicMaterial color='red' />
  }

  return <Base64Texture base64={data} />
}

export const Base64Texture: FC<{ base64: string }> = ({ base64 }) => {
  const texture1 = useTexture(base64)
  // const texture2 = new TextureLoader().load(base64)
  // console.log('texture', texture1, texture2)
  return <meshBasicMaterial map={texture1} toneMapped={false} />
}
