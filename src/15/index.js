import { readFile } from '_utils/file'
import { pipe, stringToArray } from '_utils/function'

const MAX_TURN_PART_ONE = 2020
const MAX_TURN_PART_TWO = 30000000

const findSpokenNumber = ({ startingNumbers, maxTurn }) => {
  let numbersAndTurnsCount = new Map()

  startingNumbers.forEach((num, i) =>
    numbersAndTurnsCount.set(+num, { lastTurn: i + 1, previousLastTurn: i + 1 })
  )

  let turn = startingNumbers.length + 1

  let spoken = +startingNumbers.slice(-1)[0]

  while (turn <= maxTurn) {
    if (numbersAndTurnsCount.has(spoken)) {
      const { lastTurn, previousLastTurn } = numbersAndTurnsCount.get(spoken)

      const nextSpoken = lastTurn - previousLastTurn

      let nextSpokenTurnCount = {
        lastTurn: turn,
        previousLastTurn: turn,
      }

      if (numbersAndTurnsCount.has(nextSpoken)) {
        const { lastTurn: lastTurnNextSpoken } = numbersAndTurnsCount.get(
          nextSpoken
        )

        nextSpokenTurnCount.previousLastTurn = lastTurnNextSpoken
      }

      numbersAndTurnsCount.set(nextSpoken, nextSpokenTurnCount)

      spoken = nextSpoken
    } else {
      numbersAndTurnsCount.set(spoken, {
        lastTurn: turn,
        previousLastTurn: turn,
      })

      spoken = 0
    }

    turn += 1
  }

  return spoken
}

const solve = (numbers) => {
  let result

  result = findSpokenNumber({
    startingNumbers: numbers,
    maxTurn: MAX_TURN_PART_ONE,
  })

  console.log('> result 1:', result)

  result = findSpokenNumber({
    startingNumbers: numbers,
    maxTurn: MAX_TURN_PART_TWO,
  })

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 15: Rambunctious Recitation ---')

  return readFile('15/input.in')
    .then((data) => {
      const numbers = pipe(stringToArray(','))(data)
      solve(numbers)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
