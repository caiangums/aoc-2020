export const pipe = (...fns) => (arg) => fns.reduce((acc, fn) => fn(acc), arg)

export const stringToArray = (splitVal = '\n') => (data) => data.split(splitVal)

export const stringToNumber = (data) => Number(data)

export const toNumberArray = (data) => data.map(stringToNumber)
