export const pipe = (...fns) => (arg) => fns.reduce((acc, fn) => fn(acc), arg)

export const stringToArray = (splitVal = '\n') => (data) => data.split(splitVal)

export const stringToNumber = (data) => Number(data)

export const filterNonNumbers = (arr) =>
  arr.filter((val) => !Number.isNaN(+val))

export const toNumberArray = (data) => data.map(stringToNumber)

export const arrayToString = (arr) =>
  arr.reduce((s, el) => (s.length === 0 ? `${el}` : `${s},${el}`), '')

export const arrayToStringWithSeparator = (separator = '') => (arr) =>
  arr.reduce(
    (s, el) => (s.length === 0 ? `${el}` : `${s}${separator}${el}`),
    ''
  )

export const sum = (...args) => args.reduce((s, a) => s + a, 0)

export const sumArray = (args) => sum(...args)

export const multiply = (...args) => args.reduce((m, a) => m * a, 1)

export const pipeLog = (...logArgs) => (arg) => {
  console.log(...logArgs, arg)
  return arg
}

export const reverseArr = (arr) => arr.reverse()

export const joinArrayToString = (arr) => arr.join('')

export const reverseStr = (str) =>
  pipe(stringToArray(''), reverseArr, joinArrayToString)(str)

export const sliceArray = (...args) => (arr) => arr.slice(...args)
