import { RefObject, useMemo } from "react"
import { VideoTexture } from "three"

export const VideoElementTexture = ({ videoRef }: { videoRef: RefObject<HTMLVideoElement> }) => {
  const texture = useMemo(() =>
    new VideoTexture(videoRef.current!)
    , [])

  return <meshBasicMaterial map={texture} toneMapped={false} />
}