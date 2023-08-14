import { useEffect, useRef } from "react"

export const useUserMedia = (onStreamCallback: (stream: MediaStream) => void) => {

  const onStreamCallbackRef = useRef(onStreamCallback)
  onStreamCallbackRef.current = onStreamCallback

  // TBD better cleanup probably!
  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      onStreamCallbackRef.current(stream)
    })()
  }, [onStreamCallbackRef])
}
