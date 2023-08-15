import { useRef } from 'react'

export const usePassthroughRef = <T,>(thing: T) => {
  const ref = useRef(thing)
  ref.current = thing
  return ref
}