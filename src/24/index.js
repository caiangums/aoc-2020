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
 * and adjacent tiles has its centers 2 units away from each other:
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

const PASSING_DAYS = 100

const STEP_TILE = {
  nw: [1, 1],
  w: [2, 0],
  sw: [1, -1],
  se: [-1, -1],
  e: [-2, 0],
  ne: [-1, 1],
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

/**
 * Just store flipped tiles
 */
const fillGround = (tilesFlip) =>
  tilesFlip.reduce((ground, tile) => {
    const tileKey = arrayToString(tile)

    if (ground.has(tileKey)) {
      ground.delete(tileKey)
    } else {
      ground.add(tileKey)
    }

    return ground
  }, new Set())

const getAdjacentTilesFrom = (tile) =>
  ADJACENT_TILES.map(([x, y]) => arrayToString([tile[0] + x, tile[1] + y]))

const getAdjacentTiles = (tile) =>
  pipe(stringToArray(','), toNumberArray, getAdjacentTilesFrom)(tile)

const getTileNextDayState = ({ tileState, flippedCount }) =>
  tileState ? flippedCount === 0 || flippedCount > 2 : flippedCount === 2

const passDay = (ground) => {
  const nonFlippedTilesCheck = new Set()
  const updatedGround = new Set(ground)

  // check flipped tiles
  const keysIt = ground.keys()
  let actualIt = keysIt.next()

  while (!actualIt.done) {
    const adjacentTiles = getAdjacentTiles(actualIt.value)

    const flippedCount = adjacentTiles.reduce((flipCount, adjacentTile) => {
      if (ground.has(adjacentTile)) {
        return flipCount + 1
      }

      nonFlippedTilesCheck.add(adjacentTile)
      return flipCount
    }, 0)

    const nextTileState = getTileNextDayState({
      tileState: true,
      flippedCount,
    })

    if (nextTileState) {
      updatedGround.delete(actualIt.value)
    }

    actualIt = keysIt.next()
  }

  // check non-flipped tiles that could be flipped
  const nonFlippedKeysIt = nonFlippedTilesCheck.keys()
  let actualNonFlippedIt = nonFlippedKeysIt.next()

  while (!actualNonFlippedIt.done) {
    const adjacentTiles = getAdjacentTiles(actualNonFlippedIt.value)

    const flippedCount = adjacentTiles.reduce(
      (count, adjacentTile) => (ground.has(adjacentTile) ? count + 1 : count),
      0
    )

    const nextTileState = getTileNextDayState({
      tileState: false,
      flippedCount,
    })

    if (nextTileState) {
      updatedGround.add(actualNonFlippedIt.value)
    }

    actualNonFlippedIt = nonFlippedKeysIt.next()
  }

  return updatedGround
}

const getPassingDaysGround = (ground) => {
  let dayPassedGround = ground

  let count = 0
  while (count < PASSING_DAYS) {
    dayPassedGround = passDay(dayPassedGround)

    count += 1
  }

  return dayPassedGround
}

const solve = async (lines) => {
  let result

  const tilesFlip = lines.map((line) => parseLineToTile(line))

  const ground = fillGround(tilesFlip)

  result = ground.size

  console.log('> result 1:', result)

  const allDaysPassedGround = getPassingDaysGround(ground)

  result = allDaysPassedGround.size

  console.log('> result 2:', result)
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
