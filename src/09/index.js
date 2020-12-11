import { readFile } from '_utils/file'
import { pipe, stringToArray, toNumberArray } from '_utils/function'

const getPreamble = ({ numbers, size, index }) =>
  numbers.slice(index - size, index)

const PREAMBLE_SIZE = 25

const isValidNumber = ({ num, preamble }) =>
  preamble
    .slice(0, -1)
    .some((preA, i) =>
      preamble.slice(i + 1).some((preB) => preA + preB === num)
    )

const findSumArr = ({ findNumArr, foundVal }) => {
  let foundSumArr = []

  findNumArr.some((preA, i) => {
    let actualSum = preA

    let sliceIndex = i + 1
    let searchStopped = findNumArr.slice(sliceIndex).some((preB, j) => {
      actualSum = actualSum + preB

      if (actualSum >= foundVal) {
        if (actualSum === foundVal) {
          foundSumArr = findNumArr.slice(i, sliceIndex + (j + 1))
        }

        return true
      }

      return false
    })

    return searchStopped && foundSumArr.length > 0
  })

  return foundSumArr
}

const getSumFromLowerAndHigherValues = (arr) => {
  const sortedArr = arr.sort((a, b) => a - b)

  const lowerVal = sortedArr.shift()
  const higherVal = sortedArr.pop()

  return lowerVal + higherVal
}

const solve = (numArr) => {
  let result
  let foundIndex

  numArr.some((numItem, index) => {
    if (index > PREAMBLE_SIZE - 1) {
      const preamble = getPreamble({
        numbers: numArr,
        size: PREAMBLE_SIZE,
        index,
      })

      if (!isValidNumber({ num: numItem, preamble })) {
        foundIndex = index
        result = numItem
        return true
      }
    }

    return false
  })

  console.log('> result 1:', result)

  const findNumArr = numArr.slice(0, foundIndex)

  const foundSumArr = findSumArr({ findNumArr, foundVal: result })

  result = getSumFromLowerAndHigherValues(foundSumArr)

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 09: Encoding Error ---')

  return readFile('09/input.in')
    .then((data) => {
      const numArr = pipe(stringToArray(), toNumberArray)(data)
      solve(numArr)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
