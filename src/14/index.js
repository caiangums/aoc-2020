import { readFile } from '_utils/file'
import { pipe, stringToArray } from '_utils/function'

const MASK_INSTRUCTION = 'mask'
const WRITE_MEMORY_INSTRUCTION = 'mem'
const STARTING_MASK = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

const convertToBinary = (num) =>
  num.toString(2).padStart(STARTING_MASK.length, '0')

const getInstruction = (line) => {
  const [op] = line.match(/(mem|mask)/)

  let instruction = [op]

  if (op === MASK_INSTRUCTION) {
    line.replace(/.* = ([\w\d]*)/, (_match, mask) => {
      instruction = [...instruction, mask]
    })
  }

  if (op === WRITE_MEMORY_INSTRUCTION) {
    line.replace(/\[(\d+)\] = (\d+)/, (_match, pos, val) => {
      instruction = [...instruction, pos, val]
    })
  }

  return instruction
}

const readInstructions = (lines) => lines.map(getInstruction)

const maskValue = ({ value, mask }) =>
  [...mask].reduce(
    (acc, m, i) => `${acc}${m === 'X' ? value.charAt(i) : m}`,
    ''
  )

const executeWriteMemory = ({ val, mask }) =>
  maskValue({ value: convertToBinary(+val), mask })

const executeInstructions = (mask) => (instructions) =>
  instructions.reduce((memory, [op, ...args]) => {
    if (op === WRITE_MEMORY_INSTRUCTION) {
      const [pos, val] = args
      return {
        ...memory,
        [pos]: executeWriteMemory({ val, mask }),
      }
    }

    if (op === MASK_INSTRUCTION) {
      mask = args[0]
    }

    return memory
  }, {})

const sumMemory = (memory) =>
  Object.values(memory).reduce((sum, val) => sum + parseInt(val, 2), 0)

const executePartOne = ({ mask, lines }) =>
  pipe(readInstructions, executeInstructions(mask), sumMemory)(lines)

const fillPositionsArray = ({ xCount, nonModified }) => {
  const positions = []
  let count = 0

  const maxVal = Math.pow(2, xCount)

  while (count < maxVal) {
    const bitCount = [...convertToBinary(count).slice(-xCount)]

    const positionCount = nonModified.reduce(
      (acc, m) => `${acc}${m === 'X' ? bitCount.shift() : m}`,
      ''
    )

    positions.push(parseInt(positionCount, 2))

    count += 1
  }

  return positions
}

const getNonModifiedArrayAndCount = ({ pos, mask }) =>
  [...mask].reduce(
    ({ xCount, nonModified }, m, i) => ({
      nonModified: [...nonModified, m === '0' ? pos[i] : m],
      xCount: m === 'X' ? xCount + 1 : xCount,
    }),
    { xCount: 0, nonModified: [] }
  )

const getPositions = ({ pos, mask }) =>
  pipe(getNonModifiedArrayAndCount, fillPositionsArray)({ pos, mask })

const executeWriteMemoryV2 = ({ pos, val, mask }) =>
  getPositions({ pos: [...convertToBinary(+pos)], mask }).reduce(
    (acc, position) => ({ ...acc, [position]: convertToBinary(+val) }),
    {}
  )

const executeInstructionsV2 = (mask) => (instructions) =>
  instructions.reduce((memory, [op, ...args]) => {
    if (op === WRITE_MEMORY_INSTRUCTION) {
      const [pos, val] = args
      return {
        ...memory,
        ...executeWriteMemoryV2({ pos, val, mask }),
      }
    }

    if (op === MASK_INSTRUCTION) {
      mask = args[0]
    }

    return memory
  }, {})

const executePartTwo = ({ mask, lines }) =>
  pipe(readInstructions, executeInstructionsV2(mask), sumMemory)(lines)

const solve = (lines) => {
  let result

  let mask = STARTING_MASK

  result = executePartOne({ mask, lines })

  console.log('> result 1:', result)

  mask = STARTING_MASK
  result = executePartTwo({ mask, lines })

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 14: Docking Data ---')

  return readFile('14/input.in')
    .then((data) => {
      const lines = pipe(stringToArray())(data)
      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
