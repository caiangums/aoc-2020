import { readFile } from '_utils/file'
import { pipe, stringToArray } from '_utils/function'

const ACTIVE = '#'
const INACTIVE = '.'

const CYCLES = 6
let CUBE_SIZE = 0

const createForm = (depth = 2) =>
  depth === 0
    ? [...new Array(CUBE_SIZE)].fill('.')
    : [...new Array(CUBE_SIZE)].map(() => createForm(depth - 1))

const countActive = (form, depth = 2) =>
  depth === 0
    ? form.reduce((formSum, el) => (el === ACTIVE ? formSum + 1 : formSum), 0)
    : form.reduce(
        (formSum, subform) => formSum + countActive(subform, depth - 1),
        0
      )

const isOutCenter = (v) => v < 6 || v > 13

const isOutsideOfCenter = ([i, ...args]) =>
  i !== 9 || args.reduce((acc, v) => acc || isOutCenter(v), false)

const fillCubeCenterWith = ({ cube, data }) =>
  cube.map((square, i) =>
    square.map((line, j) =>
      line.map((el, k) =>
        isOutsideOfCenter([i, j, k]) ? el : data[j - 6][k - 6]
      )
    )
  )

const fillHyperCubeCenterWith = ({ hypercube, data }) =>
  hypercube.map((cube, h) =>
    cube.map((square, i) =>
      square.map((line, j) =>
        line.map((el, k) =>
          isOutsideOfCenter([h, i, j, k]) ? el : data[i - 6][j - 6][k - 6]
        )
      )
    )
  )

const isActive = (el) => el === ACTIVE

const generateCheckArray = ({ index, max }) => {
  const checkArray = []
  if (index > 0) {
    checkArray.push(index - 1)
  }

  checkArray.push(index)

  if (index < max - 1) {
    checkArray.push(index + 1)
  }

  return checkArray
}

const willCubeElBeActive = ({ cube, i, j, k }) => {
  const el = cube[i][j][k]

  const max = cube.length
  const count = generateCheckArray({ index: i, max }).reduce(
    (sumI, a) =>
      sumI +
      generateCheckArray({ index: j, max }).reduce(
        (sumJ, b) =>
          sumJ +
          generateCheckArray({ index: k, max }).reduce(
            (sumK, c) => (isActive(cube[a][b][c]) ? sumK + 1 : sumK),
            0
          ),
        0
      ),
    0
  )

  const activeCounts = [2, 3]

  return isActive(el) ? activeCounts.includes(count - 1) : count === 3
}

const generateNextState = (cube) =>
  cube.map((square, i) =>
    square.map((line, j) =>
      line.map((_, k) =>
        willCubeElBeActive({ cube, i, j, k }) ? ACTIVE : INACTIVE
      )
    )
  )

const willHypercubeElBeActive = ({ hypercube, h, i, j, k }) => {
  const el = hypercube[h][i][j][k]

  const max = hypercube.length
  const count = generateCheckArray({ index: h, max }).reduce(
    (sumH, a) =>
      sumH +
      generateCheckArray({ index: i, max }).reduce(
        (sumI, b) =>
          sumI +
          generateCheckArray({ index: j, max }).reduce(
            (sumJ, c) =>
              sumJ +
              generateCheckArray({ index: k, max }).reduce(
                (sumK, d) =>
                  isActive(hypercube[a][b][c][d]) ? sumK + 1 : sumK,
                0
              ),
            0
          ),
        0
      ),
    0
  )

  const activeCounts = [2, 3]

  return isActive(el) ? activeCounts.includes(count - 1) : count === 3
}

const generateNextStateHyperCube = (hypercube) =>
  hypercube.map((cube, h) =>
    cube.map((square, i) =>
      square.map((line, j) =>
        line.map((_, k) =>
          willHypercubeElBeActive({ hypercube, h, i, j, k }) ? ACTIVE : INACTIVE
        )
      )
    )
  )

const getCountFromCube = (square) => {
  let cube = createForm()

  cube = fillCubeCenterWith({ cube, data: square })

  let actualCycle = 0

  while (actualCycle < CYCLES) {
    cube = generateNextState(cube)

    actualCycle += 1
  }

  return countActive(cube)
}

const getCountFromHyperCube = (square) => {
  let hypercube = createForm(3)

  hypercube = fillHyperCubeCenterWith({ hypercube, data: square })

  let actualCycle = 0

  while (actualCycle < CYCLES) {
    hypercube = generateNextStateHyperCube(hypercube)

    actualCycle += 1
  }

  return countActive(hypercube, 3)
}

const solve = async (lines) => {
  let result

  CUBE_SIZE = lines.length + CYCLES + (CYCLES - 2)

  const square = lines.map((line) => line.split(''))

  result = getCountFromCube(square)

  console.log('> result 1:', result)

  result = getCountFromHyperCube(square)

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 17: Conway Cubes ---')

  return readFile('17/input.in')
    .then((data) => {
      const lines = pipe(stringToArray())(data)
      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
