import { readFile } from '_utils/file'
import { pipe, stringToArray, arrayToString } from '_utils/function'

/**
 * Hexagonal Initial
 *
 * Think at hexagons in the carthesian plan [x, y].
 * The INITIAL_TILE will be located at [0, 0] (represented by o)
 * and adjacent tiles has its centers 4 units away from each other:
 *
 *   / \ / \ / \ / \
 *  |   | . | . |   |
 *   \ / \ / \ / \ /
 *    | . | o | . |
 *   / \ / \ / \ / \
 *  |   | . | . |   |
 *   \ / \ / \ / \ /
 *
 * tile = [x, y]
 *
 */
const INITIAL_TILE = [0, 0]

const DOUBLE_LETTER_TILE = ['s', 'n']

const STEP_TILE = {
  nw: [2, 2],
  w: [4, 0],
  sw: [2, -2],
  se: [-2, -2],
  e: [-4, 0],
  ne: [-2, 2],
}

const getStepTile = (label) => STEP_TILE[label]

const parseTileMovment = (tile) => {
  const [stepTileLabel, step] = DOUBLE_LETTER_TILE.includes(tile.charAt(0))
    ? [tile.slice(0, 2), 2]
    : [tile.slice(0, 1), 1]

  const moveTile = getStepTile(stepTileLabel)

  return [moveTile, step]
}

const parseLineToTile = (line) => {
  let pace = 0
  let tile = [...INITIAL_TILE]

  while (pace < line.length) {
    const [moveTile, step] = parseTileMovment(line.slice(pace))

    tile = tile.map((t, i) => t + moveTile[i])
    pace += step
  }

  return tile
}

const getTileState = (ground, tileKey) =>
  ground.has(tileKey) ? !ground.get(tileKey) : true

const getFlippedSum = (ground) => {
  const valuesIt = ground.values()

  let actualIt = valuesIt.next()

  let sum = actualIt.value ? 1 : 0

  while (!actualIt.done) {
    actualIt = valuesIt.next()

    sum = actualIt.value ? sum + 1 : sum
  }

  return sum
}

const solve = async (lines) => {
  let result

  const tilesFlip = lines.map((line) => parseLineToTile(line))

  const ground = new Map()
  tilesFlip.forEach((tile) => {
    const tileKey = arrayToString(tile)
    ground.set(tileKey, getTileState(ground, tileKey))
  })

  result = getFlippedSum(ground)

  console.log('> result 1:', result)
}

export default () => {
  console.log('--- Day 24: Lobby Layout ---')

  return readFile('24/input.in')
    .then((data) => {
      const lines = pipe(stringToArray())(data)

      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
