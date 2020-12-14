import { readFile } from '_utils/file'
import { pipe, stringToArray } from '_utils/function'

const AVAILABLE_SEAT = 'L'
const OCCUPIED_SEAT = '#'

const SEAT_PLACE = [AVAILABLE_SEAT, OCCUPIED_SEAT]

const isSeat = (place) => SEAT_PLACE.includes(place)

const isOccupiedSeat = (seat) => seat === OCCUPIED_SEAT

const countOccupiedSeatsAtLine = (line) =>
  line.reduce((sumAcc, seat) => (isOccupiedSeat(seat) ? sumAcc + 1 : sumAcc), 0)

const countOccupiedSeats = (area) =>
  area.reduce((sumAcc, line) => sumAcc + countOccupiedSeatsAtLine(line), 0)

const getPlacesToCheck = ({ i, j, area }) =>
  [
    [i - 1, j - 1],
    [i - 1, j],
    [i - 1, j + 1],
    [i, j - 1],
    [i, j + 1],
    [i + 1, j - 1],
    [i + 1, j],
    [i + 1, j + 1],
  ].filter(
    ([m, n]) => m >= 0 && n >= 0 && m < area.length && n < area[0].length
  )

/**
 * Check in those places
 * X X X
 * X - X
 * X X X
 */
const countFirstPartAdjacentOccupiedSeats = ({ i, j, area }) =>
  getPlacesToCheck({ i, j, area }).reduce(
    (placesSum, [m, n]) =>
      isSeat(area[m][n]) && isOccupiedSeat(area[m][n])
        ? placesSum + 1
        : placesSum,
    0
  )

const getFirstPartNextSeatState = ({ seat, i, j, area }) => {
  const adjacentOccupiedSeats = countFirstPartAdjacentOccupiedSeats({
    i,
    j,
    area,
  })

  if (!isOccupiedSeat(seat)) {
    return adjacentOccupiedSeats === 0 ? OCCUPIED_SEAT : seat
  }

  return adjacentOccupiedSeats >= 4 ? AVAILABLE_SEAT : seat
}

const generateFirstPartNextArea = (area) =>
  area.map((line, i) =>
    line.map((seat, j) =>
      isSeat(seat) ? getFirstPartNextSeatState({ seat, i, j, area }) : seat
    )
  )

/**
 * Check at directions
 *
 * \ . ^ . /
 * . \ | / .
 * < - o - >
 * . / | \ .
 * / . v . \
 *
 */
const countSecondPartAdjacentOccupiedSeats = ({ i, j, area }) =>
  getPlacesToCheck({ i, j, area }).reduce((placesSum, [m, n]) => {
    let u = m
    let v = n
    if (m < i) {
      if (n < j) {
        // \ top diagonal
        while (u >= 0 && v >= 0) {
          if (isSeat(area[u][v])) {
            return isOccupiedSeat(area[u][v]) ? placesSum + 1 : placesSum
          }
          u = u - 1
          v = v - 1
        }

        return placesSum
      }

      if (n > j) {
        // / top diagonal
        while (u >= 0 && v < area[0].length) {
          if (isSeat(area[u][v])) {
            return isOccupiedSeat(area[u][v]) ? placesSum + 1 : placesSum
          }
          u = u - 1
          v = v + 1
        }

        return placesSum
      }

      // | top line
      while (u >= 0) {
        if (isSeat(area[u][n])) {
          return isOccupiedSeat(area[u][n]) ? placesSum + 1 : placesSum
        }
        u = u - 1
      }

      return placesSum
    }

    if (m > i) {
      if (n < j) {
        // / bottom diagonal
        while (u < area.length && v >= 0) {
          if (isSeat(area[u][v])) {
            return isOccupiedSeat(area[u][v]) ? placesSum + 1 : placesSum
          }
          u = u + 1
          v = v - 1
        }

        return placesSum
      }

      if (n > j) {
        // \ bottom diagonal
        while (u < area.length && v < area[0].length) {
          if (isSeat(area[u][v])) {
            return isOccupiedSeat(area[u][v]) ? placesSum + 1 : placesSum
          }
          u = u + 1
          v = v + 1
        }

        return placesSum
      }

      // | bottom line
      while (u < area.length) {
        if (isSeat(area[u][n])) {
          return isOccupiedSeat(area[u][n]) ? placesSum + 1 : placesSum
        }
        u = u + 1
      }

      return placesSum
    }

    if (n < j) {
      // <- rigth line
      while (v >= 0) {
        if (isSeat(area[m][v])) {
          return isOccupiedSeat(area[m][v]) ? placesSum + 1 : placesSum
        }
        v = v - 1
      }

      return placesSum
    }

    if (n > j) {
      // -> right line
      while (v < area[0].length) {
        if (isSeat(area[m][v])) {
          return isOccupiedSeat(area[m][v]) ? placesSum + 1 : placesSum
        }
        v = v + 1
      }

      return placesSum
    }

    return placesSum
  }, 0)

const getSecondPartNextSeatState = ({ seat, i, j, area }) => {
  const adjacentOccupiedSeats = countSecondPartAdjacentOccupiedSeats({
    i,
    j,
    area,
  })

  if (!isOccupiedSeat(seat)) {
    return adjacentOccupiedSeats === 0 ? OCCUPIED_SEAT : seat
  }

  return adjacentOccupiedSeats >= 5 ? AVAILABLE_SEAT : seat
}

const generateSecondPartNextArea = (area) =>
  area.map((line, i) =>
    line.map((seat, j) =>
      isSeat(seat) ? getSecondPartNextSeatState({ seat, i, j, area }) : seat
    )
  )

const solve = (lines) => {
  let result

  let area = lines.map((line) => stringToArray('')(line))

  let occupiedSeats = countOccupiedSeats(area)
  let previousOccupiedSeats = -1

  while (occupiedSeats !== previousOccupiedSeats) {
    previousOccupiedSeats = occupiedSeats

    area = generateFirstPartNextArea(area)

    occupiedSeats = countOccupiedSeats(area)
  }

  result = occupiedSeats

  console.log('> result 1:', result)

  area = lines.map((line) => stringToArray('')(line))
  occupiedSeats = countOccupiedSeats(area)
  previousOccupiedSeats = -1

  while (occupiedSeats !== previousOccupiedSeats) {
    previousOccupiedSeats = occupiedSeats

    area = generateSecondPartNextArea(area)

    occupiedSeats = countOccupiedSeats(area)
  }

  result = occupiedSeats

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 11: Seating System ---')

  return readFile('11/input.in')
    .then((data) => {
      const lines = pipe(stringToArray())(data)
      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
