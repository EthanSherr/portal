export type CancelFn = () => void

// preferable that you use an abort controller / signal, but sometimes you don't have that option!
export const cancellablePromise = <T,>(
  fn: () => Promise<T>,
  cleanup?: () => void): [Promise<T>, CancelFn] => {

  let cancelled = false
  let completed = false

  const cancelIfNecessary = () => {
    if (!cancelled) return false
    cleanup?.()
    return true
  }


  const p = new Promise<T>((res, rej) => {
    fn()
      .then(value => {
        if (cancelIfNecessary()) return
        completed = true
        res(value)
      })
      .catch(e => {
        if (cancelIfNecessary()) return
        rej(e)
      })
  })

  return [p, () => {
    cancelled = true
    // the promise already finished, do cleanup
    if (completed) {
      cleanup?.()
    }
  }]
}