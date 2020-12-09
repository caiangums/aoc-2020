import { readFile, getLinesFromFile } from '_utils/file'

let executedInstructionIndexes = new Set()

let ACCUMULATOR = 0

const parseInstruction = (instruction) => {
  let operand, argument
  instruction.replace(/(\w{3}) ((\+|-)\d+)/g, (_match, op, arg) => {
    operand = op
    argument = arg
  })

  return [operand, argument]
}

const OPERATIONS = {
  JUMP: 'jmp',
  ACC: 'acc',
  NOP: 'nop',
}

const executeOperation = ({ operation, argument, instructionIndex }) => {
  if (operation === OPERATIONS.JUMP) {
    return +argument + instructionIndex
  }

  if (operation === OPERATIONS.ACC) {
    ACCUMULATOR += +argument
  }

  return instructionIndex + 1
}

const EXEC_STATE = {
  HALTED: 'halted',
  RUNNING: 'running',
}

const execute = ({ instruction, instructionIndex }) => {
  const [operation, argument] = parseInstruction(instruction)

  const nextInstructionIndex = executeOperation({
    operation,
    argument,
    instructionIndex,
  })

  return nextInstructionIndex
}

const executeWithUniqueInstructionsCheck = ({
  instruction,
  instructionIndex,
}) => {
  const previousAccumulator = ACCUMULATOR

  const nextInstructionIndex = execute({ instruction, instructionIndex })

  if (executedInstructionIndexes.has(nextInstructionIndex)) {
    return {
      state: EXEC_STATE.HALTED,
      previousAccumulator,
    }
  }

  executedInstructionIndexes.add(nextInstructionIndex)

  return {
    state: EXEC_STATE.RUNNING,
    nextInstructionIndex,
  }
}

const convertOperand = (operand) =>
  operand === OPERATIONS.JUMP ? OPERATIONS.NOP : OPERATIONS.JUMP

const getAllChangedInstructions = (instructions) =>
  instructions.reduce(
    ({ changedInstructions, changedIndexes }, instruction, index) => {
      const [operand, argument] = parseInstruction(instruction)
      return operand !== OPERATIONS.ACC
        ? {
            changedInstructions: [
              `${convertOperand(operand)} ${argument}`,
              ...changedInstructions,
            ],
            changedIndexes: [index, ...changedIndexes],
          }
        : { changedInstructions, changedIndexes }
    },
    { changedInstructions: [], changedIndexes: [] }
  )

const solve = (lines) => {
  let result = 0

  let instructionIndex = 0

  while (instructionIndex < lines.length) {
    const instruction = lines[instructionIndex]

    const {
      state,
      nextInstructionIndex,
      previousAccumulator,
    } = executeWithUniqueInstructionsCheck({
      instruction,
      instructionIndex,
    })

    if (state === EXEC_STATE.HALTED) {
      result = previousAccumulator
      break
    }

    instructionIndex = nextInstructionIndex
  }

  console.log('> result 1:', result)

  ACCUMULATOR = 0
  instructionIndex = 0
  executedInstructionIndexes = new Set()

  let { changedInstructions, changedIndexes } = getAllChangedInstructions(lines)

  let haltInstructionIndex = -1
  let haltInstruction

  while (instructionIndex < lines.length) {
    let instruction =
      haltInstructionIndex === instructionIndex
        ? haltInstruction
        : lines[instructionIndex]

    const { state, nextInstructionIndex } = executeWithUniqueInstructionsCheck({
      instruction,
      instructionIndex,
    })

    if (state === EXEC_STATE.HALTED) {
      ACCUMULATOR = 0
      instructionIndex = 0
      executedInstructionIndexes = new Set()

      haltInstructionIndex = changedIndexes.pop()
      haltInstruction = changedInstructions.pop()
    } else {
      instructionIndex = nextInstructionIndex
    }
  }

  result = ACCUMULATOR

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 08: Handheld Halting ---')

  return readFile('08/input.in')
    .then((data) => {
      const lines = getLinesFromFile(data)
      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
