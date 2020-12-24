import { readFile } from '_utils/file'
import { pipe, stringToArray, reverseStr } from '_utils/function'

/**
 *    N        1
 *  W o E -> 4 o 2
 *    S        3
 */
function Tile(tile) {
  let name
  let corners = []
  let reversedCorners = []
  let cornerTiles = Array(4).fill(null)

  const initTile = () => {
    const [firstLine, ...rest] = stringToArray()(tile)

    name = firstLine.match(/\d+/g)[0]

    const [north, south] = [rest[0], rest[rest.length - 1]]

    const [east, west] = rest.reduce(
      ([east, west], line) => [
        `${east}${line.slice(0, 1)}`,
        `${west}${line.slice(-1)}`,
      ],
      ['', '']
    )

    corners = [north, east, south, west]
    reversedCorners = corners.map((corner) => reverseStr(corner))
  }
  initTile()

  const setCornerTile = (tile, pos) => (cornerTiles[pos] = tile.name)

  return {
    name,
    corners,
    reversedCorners,
    cornerTiles,
    clone: () => Tile(tile),
    setCornerTile,
  }
}

const findConnectionBetweenTiles = ({ tileCorners, otherTileCorners }) => {
  let foundConnection = -1

  tileCorners.some((corner, pos) => {
    if (otherTileCorners.indexOf(corner) >= 0) {
      foundConnection = pos
      return true
    }

    return false
  })

  return foundConnection
}

const buildNewTileWithConnections = ({ tile, otherTile }) => {
  const foundConnection = findConnectionBetweenTiles({
    tileCorners: tile.corners,
    otherTileCorners: otherTile.corners,
  })

  const foundReversedConnection = findConnectionBetweenTiles({
    tileCorners: tile.reversedCorners,
    otherTileCorners: otherTile.corners,
  })

  if (foundConnection >= 0) {
    tile.setCornerTile(otherTile, foundConnection)
  }

  if (foundReversedConnection >= 0) {
    tile.setCornerTile(otherTile, foundReversedConnection)
  }

  return tile
}

const connectTiles = (tilesArr) =>
  tilesArr.map((tile, i) => {
    let newTile = tile.clone()
    tilesArr.forEach((otherTile, j) => {
      if (i !== j) {
        newTile = buildNewTileWithConnections({ tile: newTile, otherTile })
      }
    })

    return newTile
  })

const solve = async (tiles) => {
  let result

  let tilesArr = tiles.map((tile) => Tile(tile))

  tilesArr = connectTiles(tilesArr)

  const cornerTilesArr = tilesArr.filter(
    (tile) => tile.cornerTiles.filter((corner) => corner !== null).length === 2
  )

  result = cornerTilesArr.reduce((mult, tile) => mult * +tile.name, 1)

  console.log('> result 1:', result)
}

export default () => {
  console.log('--- Day 20: Jurassic Jigsaw ---')

  return readFile('20/input.in')
    .then((data) => {
      const tiles = pipe(stringToArray('\n\n'))(data)

      solve(tiles)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
