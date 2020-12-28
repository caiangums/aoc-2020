import { readFile } from '_utils/file'
import {
  pipe,
  stringToArray,
  toNumberArray,
  arrayToStringWithSeparator,
} from '_utils/function'

const ROUNDS = 100
const AFTER_CUP = 1

const MAX_VALUE_PART_TWO = 1000000 // one million
const ROUNDS_PART_TWO = 10000000 // ten million

const getNextCupValueRef = (arr, i) => arr[(i + 1) % arr.length]

const findSliceCupIndex = (cups, actualCup) => {
  const sliceCupIndex = cups.slice(4).findIndex((v) => v === actualCup - 1)

  if (sliceCupIndex >= 0) {
    return sliceCupIndex
  }

  const newActualCup = actualCup - 1 < 0 ? Math.max(...cups) + 1 : actualCup - 1

  return findSliceCupIndex(cups, newActualCup)
}

const crabMove = (cups, moveCount = 0, rounds = ROUNDS) => {
  const actualCup = cups[0]
  const sequenceCups = cups.slice(1, 4)

  const sliceCupIndex = findSliceCupIndex(cups, actualCup)

  let movedCups = cups.slice(4)
  movedCups = [
    ...movedCups.slice(0, sliceCupIndex + 1),
    ...sequenceCups,
    ...movedCups.slice(sliceCupIndex + 1),
    actualCup,
  ]

  return moveCount < rounds - 1
    ? crabMove(movedCups, moveCount + 1, rounds)
    : movedCups
}

const getNewValue = (actualValue) =>
  actualValue - 1 === 0 ? MAX_VALUE_PART_TWO : actualValue - 1

// Again, the issue was max call stack for recursive calls...
const nonRecursiveCrabMove = (
  cups,
  cupsReferences,
  rounds = ROUNDS_PART_TWO
) => {
  let actualRounds = 0

  let actualCup = cups[0]
  while (actualRounds < rounds) {
    let nextCup1 = actualCup.next
    let nextCup2 = nextCup1.next
    let nextCup3 = nextCup2.next
    let nextActualCup = nextCup3.next

    let newValue = getNewValue(actualCup.value)
    let updateCup = cupsReferences.get(newValue)
    while (
      [nextCup1.value, nextCup2.value, nextCup3.value].includes(newValue)
    ) {
      newValue = getNewValue(newValue)
      updateCup = cupsReferences.get(newValue)
    }

    const oldUpdateCupNext = updateCup.next
    updateCup.next = nextCup1
    nextCup3.next = oldUpdateCupNext

    actualCup.next = nextActualCup
    actualCup = nextActualCup

    actualRounds += 1
  }

  return cups
}

const getSumArray = (value = AFTER_CUP) => (arr) => {
  const sliceIndex = arr.findIndex((v) => v === value)

  return [...arr.slice(sliceIndex + 1), ...arr.slice(0, sliceIndex)]
}

// Cup object for references inside the list
function Cup(value, next = null) {
  return {
    value,
    next,
  }
}

// create linked list
const getPartTwoCups = (cups) => {
  let max = Math.max(...cups) + 1
  let partTwoCups = [
    ...cups,
    ...Array(MAX_VALUE_PART_TWO - cups.length)
      .fill(0)
      .map((_v, i) => max + i),
  ].map((v) => Cup(v))

  // no shorthand = maintain references
  partTwoCups = partTwoCups.map((c, i) => {
    c.next = getNextCupValueRef(partTwoCups, i)

    return c
  })

  return partTwoCups
}

// keep searches O(1)
const createMapReference = (cups) => new Map(cups.map((c) => [c.value, c]))

const solve = async (line) => {
  let result

  let cups = pipe(stringToArray(''), toNumberArray)(line)

  let finalCups = crabMove(cups)

  result = pipe(getSumArray(), arrayToStringWithSeparator())(finalCups)

  console.log('> result 1:', result)

  cups = getPartTwoCups(cups)

  const cupsReferencesMap = createMapReference(cups)

  finalCups = nonRecursiveCrabMove(cups, cupsReferencesMap)

  const cupOne = cupsReferencesMap.get(1)
  const cup1 = cupOne.next
  const cup2 = cup1.next

  result = cup1.value * cup2.value

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 23: Crab Cups ---')

  return readFile('23/input.in')
    .then((data) => {
      solve(data)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
