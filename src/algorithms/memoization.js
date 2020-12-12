import { arrayToString } from '_utils/function'

export const memoize = (fn) => {
  const memo = new Map()

  return (...args) => {
    const argsString = arrayToString(args)

    if (!memo.has(argsString)) {
      memo.set(argsString, fn(...args))
    }

    return memo.get(argsString)
  }
}
