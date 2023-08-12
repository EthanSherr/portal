import { FC, Suspense } from 'react'
import { useVideoTexture } from '@react-three/drei'

export type PortalProps = {
  url: string
}

export const Portal: FC<PortalProps> = ({ url }) => {
  return (
    <mesh position={[0, 0, 0]} >
      <planeGeometry args={[3, 3]} />
      <Suspense fallback={<meshBasicMaterial color='black' />}>
        <VideoMaterial url={url} />
      </Suspense>
    </mesh>
  )
}

export const VideoMaterial: FC<{ url: string }> = ({ url }) => {
  const texture = useVideoTexture(url, { volume: 1 })
  return <meshBasicMaterial map={texture} toneMapped={false} />
}