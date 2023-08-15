import { useEffect } from "react"
import { cancellablePromise } from "../helpers/cancellablePromise"

export type AsyncEffectParams = { effectFn: () => Promise<void>, cleanupFn?: () => void }

export const useAsyncEffect = ({ effectFn, cleanupFn }: AsyncEffectParams, deps: React.DependencyList | undefined) => {
  useEffect(() => {
    const [_, cancelPromise] = cancellablePromise(effectFn, cleanupFn)
    return cancelPromise
  }, deps)
}