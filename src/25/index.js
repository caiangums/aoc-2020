import { readFile } from '_utils/file'
import { pipe, stringToArray, toNumberArray } from '_utils/function'

const DIVISOR = 20201227

const transform = (actual, subjectNumber) => (actual * subjectNumber) % DIVISOR

const getEncryptionKey = (subjectNumber, loops) => {
  let actual = 1
  let count = 0

  while (count < loops) {
    actual = transform(actual, subjectNumber)
    count += 1
  }

  return actual
}

const getTransformLoopSizeFromKey = (resultingPublicKey) => {
  const subjectNumber = 7
  let actual = 1
  let count = 0

  while (actual !== resultingPublicKey) {
    actual = transform(actual, subjectNumber)
    count += 1
  }

  return count
}

const solve = async (lines) => {
  let result

  const [cardPublicKey, doorPublicKey] = lines

  const doorLoopSize = getTransformLoopSizeFromKey(doorPublicKey)
  const cardLoopSize = getTransformLoopSizeFromKey(cardPublicKey)

  // both should be the same!
  const doorEncryptionKey = getEncryptionKey(doorPublicKey, cardLoopSize)
  const cardEncryptionKey = getEncryptionKey(cardPublicKey, doorLoopSize)

  if (doorEncryptionKey !== cardEncryptionKey) {
    console.log('Error on finding Encryption Key!')
  }

  result = doorEncryptionKey

  console.log('> result 1:', result)
}

export default () => {
  console.log('--- Day 25: Combo Breaker ---')

  return readFile('25/input.in')
    .then((data) => {
      const lines = pipe(stringToArray(), toNumberArray)(data)

      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}

// 13220485 - too low
