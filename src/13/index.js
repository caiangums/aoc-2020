import { readFile } from '_utils/file'
import {
  pipe,
  stringToArray,
  filterNonNumbers,
  toNumberArray,
} from '_utils/function'

const getDivisorsArr = (line) =>
  pipe(stringToArray(','), filterNonNumbers, toNumberArray)(line)

// const filterNonNumbersWithOffset = (arr) =>
//   arr.reduce(
//     (acc, val, index) =>
//       Number.isNaN(+val) ? acc : [...acc, { value: +val, offset: index }],
//     []
//   )

// const getDivisorsWithOffsetArr = (line) =>
//   pipe(stringToArray(','), filterNonNumbersWithOffset)(line)

const solve = (lines) => {
  let result

  const startTimestamp = Number(lines[0])
  let timestamp = startTimestamp - 1

  const divisorsArr = getDivisorsArr(lines[1])

  let found = 0

  while (!found) {
    timestamp += 1

    found = divisorsArr.find((divisor) => (timestamp / divisor) % 1 === 0)
  }

  result = (timestamp - startTimestamp) * found

  console.log('> result 1:', result)

  console.log('> result 2: TODO: must use Chinese Remainder Theorem')
}

export default () => {
  console.log('--- Day 13: Shuttle Search ---')

  return readFile('13/input.in')
    .then((data) => {
      const lines = pipe(stringToArray())(data)
      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
