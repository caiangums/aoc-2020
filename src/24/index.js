import { readFile } from '_utils/file'
import {
  pipe,
  stringToArray,
  arrayToString,
  toNumberArray,
} from '_utils/function'

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

const PASSING_DAYS = 1

const STEP_TILE = {
  nw: [2, 2],
  w: [4, 0],
  sw: [2, -2],
  se: [-2, -2],
  e: [-4, 0],
  ne: [-2, 2],
}

const ADJACENT_TILES = Object.values(STEP_TILE)

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

const fillGround = (tilesFlip) => {
  const ground = new Map()

  tilesFlip.forEach((tile) => {
    const tileKey = arrayToString(tile)
    ground.set(tileKey, getTileState(ground, tileKey))
  })

  return ground
}

const getAdjacentTilesFrom = (tile) =>
  ADJACENT_TILES.map(([x, y]) => arrayToString([tile[0] + x, tile[1] + y]))

const getTileNextDayState = ({ tileState, adjacentTiles, ground }) => {
  const flippedCount = adjacentTiles.reduce(
    (flipped, tile) => (ground.get(tile) ? flipped + 1 : flipped),
    0
  )

  // console.log(flippedCount)
  // true = flipped
  return tileState ? flippedCount === 0 || flippedCount > 2 : flippedCount === 2
}

const passDays = (ground, days = PASSING_DAYS) => {
  let countDays = 0
  let updatedGround = new Map(ground)

  while (countDays < days) {
    const actualUpdatedGround = new Map(updatedGround)
    console.log(`day ${countDays + 1} = ${getFlippedSum(actualUpdatedGround)}`)

    const keysIt = actualUpdatedGround.keys()

    let actualIt = keysIt.next()
    const tilesArr = []

    while (!actualIt.done) {
      tilesArr.push(actualIt.value)
      actualIt = keysIt.next()
    }

    tilesArr.forEach((actualTile) => {
      const tileState = updatedGround.get(actualTile)
      const adjacentTiles = pipe(
        stringToArray(','),
        toNumberArray,
        getAdjacentTilesFrom
      )(actualTile)

      const adjacentTilesMap = new Map()
      adjacentTiles.forEach((adjacentTile) => {
        if (!actualUpdatedGround.has(adjacentTile)) {
          actualUpdatedGround.set(adjacentTile, false)
        }

        let tileState = false
        if (updatedGround.has(adjacentTile)) {
          tileState = updatedGround.get(adjacentTile)
        }

        adjacentTilesMap.set(adjacentTile, tileState)
      })

      const tileNextState = getTileNextDayState({
        tileState,
        adjacentTiles,
        ground: adjacentTilesMap,
      })

      actualUpdatedGround.set(actualTile, tileNextState)
    })

    updatedGround = actualUpdatedGround

    console.log(`day ${countDays + 1} = ${getFlippedSum(updatedGround)}`)
    countDays += 1
  }

  return updatedGround
}

const solve = async (lines) => {
  let result

  const tilesFlip = lines.map((line) => parseLineToTile(line))

  const ground = fillGround(tilesFlip)

  result = getFlippedSum(ground)

  console.log('> result 1:', result)

  const updatedGround = passDays(ground)

  result = getFlippedSum(updatedGround)

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 24: Lobby Layout ---')

  return readFile('24/test.in')
    .then((data) => {
      const lines = pipe(stringToArray())(data)

      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
