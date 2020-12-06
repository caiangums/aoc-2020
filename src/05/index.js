import { readFile, getLinesFromFile } from '_utils/file'

const ROW_ZERO = 'F'
const COL_ZERO = 'L'

const getBinaryValue = ({ letter, i, zero = ROW_ZERO }) =>
  letter === zero ? 0 : Math.pow(2, i)

const getSingleSection = ({ code, isRow = true }) =>
  code.split('').reduce(
    (num, letter, i, fullString) =>
      getBinaryValue({
        letter,
        i: fullString.length - (i + 1),
        zero: isRow ? ROW_ZERO : COL_ZERO,
      }) + num,
    0
  )

const parsePlaneSeat = (code) => ({
  row: getSingleSection({ code: code.slice(0, 7) }),
  col: getSingleSection({ code: code.slice(7), isRow: false }),
})

const getActualId = ({ row, col }) => row * 8 + col

const solve = (lines) => {
  let result = lines.reduce((higherId, line) => {
    const actualId = getActualId(parsePlaneSeat(line))

    return actualId > higherId ? actualId : higherId
  }, -1)

  console.log('> result 1:', result)

  let previousSeatId = 0
  lines
    .map((line) => getActualId(parsePlaneSeat(line)))
    .sort((a, b) => a - b)
    .some((seatId) => {
      if (seatId - previousSeatId === 1 || previousSeatId === 0) {
        previousSeatId = seatId
        return false
      }

      result = previousSeatId + 1
      return true
    })

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 05: Binary Boarding ---')

  return readFile('05/input.in')
    .then((data) => {
      const lines = getLinesFromFile(data)
      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
