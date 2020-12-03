import { readFile } from '_utils/file'

const getLines = (data) => data.split('\n')

const getNextPosition = ({ actual, mod, steps = 3 }) => (actual + steps) % mod

const TREE = '#'

const getActualStepTreeCount = ({ actualPosition, line, steps, trees }) => {
  const position = getNextPosition({
    actual: actualPosition,
    mod: line.length,
    steps,
  })

  return line.charAt(position) === TREE
    ? { position, trees: trees + 1 }
    : { position, trees }
}

const getStartObjCount = () => ({ trees: 0, position: 0 })

const getTreeCount = ({ mountain, steps, hops = 1 }) =>
  hops === 1
    ? mountain.reduce(
        ({ trees, position }, line) =>
          getActualStepTreeCount({
            actualPosition: position,
            line,
            steps,
            trees,
          }),
        getStartObjCount()
      )
    : mountain.reduce(
        ({ trees, position }, line, i) =>
          (i + 1) % hops === 0
            ? getActualStepTreeCount({
                actualPosition: position,
                line,
                steps,
                trees,
              })
            : { trees, position },
        getStartObjCount()
      )

const solve = (lines) => {
  let [, ...restLines] = lines

  let { trees } = getTreeCount({ mountain: restLines, steps: 3, hops: 1 })

  console.log('> result 1:', trees)

  const STEPS_AND_HOPS = [
    { steps: 1, hops: 1 },
    { steps: 3, hops: 1 },
    { steps: 5, hops: 1 },
    { steps: 7, hops: 1 },
    { steps: 1, hops: 2 },
  ]

  const result = STEPS_AND_HOPS.reduce(
    (multiplied, stepsAndHops) =>
      multiplied * getTreeCount({ mountain: restLines, ...stepsAndHops }).trees,
    1
  )

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 03: Toboggan Trajectory ---')

  return readFile('03/input.in')
    .then((data) => {
      const lines = getLines(data)
      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
