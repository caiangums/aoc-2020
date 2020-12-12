import { readFile } from '_utils/file'
import { pipe, stringToArray, toNumberArray, sum } from '_utils/function'
import { memoize } from '_algorithms/memoization'

const getJoltsSequence = (joltsArr) => {
  const batteryJolts = 0
  const sortedAdaptersJolts = [...joltsArr].sort((a, b) => a - b)
  const deviceBuiltInJolts = sortedAdaptersJolts.slice(-1).pop() + 3

  return [batteryJolts, ...sortedAdaptersJolts, deviceBuiltInJolts]
}

const getJoltsDifferences = ([firstJoltItem, ...joltsSequence]) =>
  joltsSequence.reduce(
    ({ previousJolts, oneDiff, twoDiff, threeDiff }, jolts) => ({
      previousJolts: jolts,
      oneDiff: jolts - previousJolts === 1 ? oneDiff + 1 : oneDiff,
      twoDiff: jolts - previousJolts === 2 ? twoDiff + 1 : twoDiff,
      threeDiff: jolts - previousJolts === 3 ? threeDiff + 1 : threeDiff,
    }),
    { previousJolts: firstJoltItem, oneDiff: 0, twoDiff: 0, threeDiff: 0 }
  )

const countSequences = (sequence) => {
  if (sequence.length === 1) {
    return 1
  }

  const [actual, nextOne, nextTwo, nextThree] = sequence

  const nextSequences = [sequence.slice(1)]

  if (sum(nextOne, -actual) < 3 && sum(nextTwo, -actual) < 4) {
    nextSequences.push(sequence.slice(2))

    if (sum(nextThree, -actual) < 4) {
      nextSequences.push(sequence.slice(3))
    }
  }

  return sum(...nextSequences.map((s) => memoCountSequences(s)))
}

const memoCountSequences = memoize(countSequences)

const solve = (numArr) => {
  let result

  const joltsSequence = getJoltsSequence(numArr)

  const { oneDiff, threeDiff } = getJoltsDifferences(joltsSequence)

  result = oneDiff * threeDiff

  console.log('> result 1:', result)

  result = memoCountSequences(joltsSequence)

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 10: Adapter Array ---')

  return readFile('10/input.in')
    .then((data) => {
      const numArr = pipe(stringToArray(), toNumberArray)(data)
      solve(numArr)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
