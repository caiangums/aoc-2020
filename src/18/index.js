import { readFile } from '_utils/file'
import { pipe, stringToArray, sum, multiply } from '_utils/function'
import { isStringEmpty } from '_utils/validate'

const OPERATIONS = {
  SUM: '+',
  MULT: '*',
}

const OPEN_OPERATION = '('

const hasSumOperation = (line) => line.indexOf(OPERATIONS.SUM) >= 0

const hasPriorityOperation = (line) => line.indexOf(OPEN_OPERATION) >= 0

const doOperation = ([a, op, b]) =>
  op === OPERATIONS.SUM ? sum(a, b) : multiply(a, b)

const replacePriorityOperations = (line) =>
  line.replace(
    /\((\d+) (\+|\*) (\d+)( (\+|\*) (\d+))*\)/g,
    (_match, a, op, b, operationLeft) =>
      operationLeft && !isStringEmpty(operationLeft)
        ? replacePriorityOperations(
            _match.replace(/(\d+) (\+|\*) (\d+)/, doOperation([+a, op, +b]))
          )
        : doOperation([+a, op, +b])
  )

const clearPriorityOperations = (line) =>
  hasPriorityOperation(line)
    ? pipe(replacePriorityOperations, clearPriorityOperations)(line)
    : line

const hasOperation = (line) => line.indexOf(' ') > 0

const replaceOperation = (line) =>
  line.replace(/(\d+) (\+|\*) (\d+)/, (_match, a, op, b) =>
    doOperation([+a, op, +b])
  )

const doAllLineOperations = (line) =>
  hasOperation(line) ? pipe(replaceOperation, doAllLineOperations)(line) : line

const doLineOperations = (line) =>
  pipe(clearPriorityOperations, doAllLineOperations)(line)

const doOperationsEqualPrecedence = (lines) =>
  lines.reduce((sum, line) => sum + +doLineOperations(line), 0)

const doContentOperationsSumFirst = (content) =>
  content.replace(
    /(\d+) (\+) (\d+)( (\+|\*) (\d+))*/g,
    (_match, a, op, b, operationLeft) =>
      operationLeft && !isStringEmpty(operationLeft)
        ? doContentOperationsSumFirst(
            _match.replace(/(\d+) (\+) (\d+)/, doOperation([+a, op, +b]))
          )
        : doOperation([+a, op, +b])
  )

const doRemainingSumOperations = (content) =>
  hasSumOperation(content)
    ? pipe(
        clearPriorityOperationsSumFirst,
        doContentOperationsSumFirst,
        doRemainingSumOperations,
        doAllLineOperations
      )(content)
    : content

const clearPriorityOperationsSumFirst = (line) =>
  line.replace(/\(([\d+* ]*)\)/g, (_match, content) =>
    hasPriorityOperation(content)
      ? clearPriorityOperationsSumFirst(content)
      : pipe(doRemainingSumOperations, doAllLineOperations)(content)
  )

const doLineOperationsSumFirst = (line) =>
  pipe(
    clearPriorityOperationsSumFirst,
    doRemainingSumOperations,
    doLineOperations
  )(line)

const doOperationsSumPrecedenceFirst = (lines) =>
  lines.reduce((sum, line) => sum + +doLineOperationsSumFirst(line), 0)

const solve = async (lines) => {
  let result = doOperationsEqualPrecedence(lines)

  console.log('> result 1:', result)

  result = doOperationsSumPrecedenceFirst(lines)

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 18: Operation Order ---')

  return readFile('18/input.in')
    .then((data) => {
      const lines = pipe(stringToArray())(data)
      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
