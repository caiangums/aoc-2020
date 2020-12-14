import { readFile } from '_utils/file'
import { pipe, stringToArray } from '_utils/function'

const DIRECTIONS_MOVES = {
  N: [1, 0],
  E: [0, 1],
  S: [-1, 0],
  W: [0, -1],
}

const DIRECTIONS = Object.keys(DIRECTIONS_MOVES)

const TURN_MOVES = ['L', 'R']

const isRightRotation = (action) => action === TURN_MOVES[1]

const getManhattanDistance = ({ startPoint, endPoint }) =>
  endPoint.reduce(
    (sum, coord, i) =>
      Math.abs(Math.abs(coord) - Math.abs(startPoint[i])) + sum,
    0
  )

function Boat({ startPosition = [0, 0], facingDirection = 'E' } = {}) {
  let position = startPosition
  let face = facingDirection

  const moveBasedOnDirection = ({ direction, value }) =>
    position.map((coord, i) => coord + DIRECTIONS_MOVES[direction][i] * value)

  const move = ({ action, value }) => {
    if (DIRECTIONS.includes(action)) {
      position = moveBasedOnDirection({ direction: action, value: +value })
      return
    }

    if (action === 'F') {
      position = moveBasedOnDirection({ direction: face, value: +value })
      return
    }

    if (TURN_MOVES.includes(action)) {
      let actualFaceIndex = DIRECTIONS.indexOf(face)
      let newFaceIndexDegrees = value / 90

      let newFaceIndex =
        (!isRightRotation(action)
          ? actualFaceIndex - newFaceIndexDegrees + 4
          : actualFaceIndex + newFaceIndexDegrees) % 4

      face = DIRECTIONS[newFaceIndex]
    }
  }

  const getManhattan = () =>
    getManhattanDistance({ startPoint: startPosition, endPoint: position })

  return {
    move,
    getManhattan,
  }
}

const getRotatedWaypointArray = ([a, b], action) => [
  [a, b],
  isRightRotation(action) ? [-1 * b, a] : [-1 * b, a],
  [-1 * a, -1 * b],
  isRightRotation(action) ? [b, -1 * a] : [b, -1 * a],
]

const rotateWaypoint = ({ times, waypoint, action }) =>
  getRotatedWaypointArray(waypoint, action)[times]

function BoatWithWaypoint({
  startPosition = [0, 0],
  facingDirection = 'E',
  startWaypoint,
} = {}) {
  let position = startPosition
  let face = facingDirection
  let waypoint = startWaypoint

  const moveBoatForward = ({ value }) =>
    position.map((coord, i) => coord + waypoint[i] * value)

  const updateWaypoint = ({ action, value, actualWaypoint }) => {
    const moveTo = DIRECTIONS_MOVES[action]
    return actualWaypoint.map((coord, i) => coord + moveTo[i] * value)
  }

  const move = ({ action, value }) => {
    if (DIRECTIONS.includes(action)) {
      waypoint = updateWaypoint({
        action,
        value: +value,
        actualWaypoint: waypoint,
      })
      return
    }

    if (action === 'F') {
      position = moveBoatForward({ value: +value })
      return
    }

    if (TURN_MOVES.includes(action)) {
      let actualFaceIndex = DIRECTIONS.indexOf(face)
      let newFaceIndexDegrees = value / 90

      let newFaceIndex =
        (!isRightRotation(action)
          ? actualFaceIndex - newFaceIndexDegrees
          : actualFaceIndex + newFaceIndexDegrees) % 4

      let times = (newFaceIndex - actualFaceIndex + 4) % 4

      waypoint = rotateWaypoint({ waypoint, action, times })
      face = DIRECTIONS[newFaceIndex]
    }
  }

  const getManhattan = () =>
    getManhattanDistance({ startPoint: startPosition, endPoint: position })

  return {
    move,
    getManhattan,
  }
}

const getActionAndValue = (command) => command.match(/(\w{1})(\d*)/)

const solve = (commands) => {
  let result

  const boat = Boat()

  commands.forEach((command) => {
    const [, action, value] = getActionAndValue(command)
    boat.move({ action, value })
  })

  result = boat.getManhattan()

  console.log('> result 1:', result)

  const startWaypoint = [1, 10] // problem description
  const boatWithWayPoint = BoatWithWaypoint({ startWaypoint })

  commands.forEach((command) => {
    const [, action, value] = getActionAndValue(command)
    boatWithWayPoint.move({ action, value })
  })

  result = boatWithWayPoint.getManhattan()

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 12: Rain Risk ---')

  return readFile('12/input.in')
    .then((data) => {
      const lines = pipe(stringToArray())(data)
      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
