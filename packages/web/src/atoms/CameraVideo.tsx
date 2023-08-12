import { useEffect, useRef, useState } from "react"

export const CameraVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const p = navigator.mediaDevices.getUserMedia({ video: true })
    p.then((signal) => {
      const video = videoRef.current
      if (!video) {
        console.error("no video element when camera signal returned")
        return
      }
      videoRef.current.srcObject = signal
      videoRef.current.play()
    })
  }, [])

  return <video ref={videoRef} style={{ width: '100%', height: '100%', backgroundColor: 'black' }}></video>
}