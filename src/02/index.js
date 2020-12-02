import { readFile } from '_utils/file'

const getLines = (data) => data.split('\n')

const getLetterCountFromPassword = (password, letter) =>
  (password.match(new RegExp(letter, 'g')) || []).length

const isBetween = ({ value, min, max }) => value >= min && value <= max

const hasJustOneOccurrenceFromPositions = ({ password, letter, positions }) => {
  const [hasPosition1, hasPosition2] = positions.map(
    (pos) => password.charAt(pos) === letter
  )

  return (!hasPosition1 && hasPosition2) || (hasPosition1 && !hasPosition2)
}

const solve = (lines) => {
  let result

  result = lines.reduce((acc, line) => {
    if (!line) {
      return acc
    }

    let count = acc

    line.replace(
      /(\d*)-(\d*) (\w): (\w*)/g,
      (_, min, max, letter, password) => {
        const letterCount = getLetterCountFromPassword(password, letter)

        count = isBetween({ value: letterCount, min: +min, max: +max })
          ? count + 1
          : count
      }
    )

    return count
  }, 0)

  console.log('> result 1:', result)

  result = lines.reduce((acc, line) => {
    if (!line) {
      return acc
    }

    let count = acc

    line.replace(
      /(\d*)-(\d*) (\w): (\w*)/g,
      (_, pos1, pos2, letter, password) => {
        count = hasJustOneOccurrenceFromPositions({
          password,
          letter,
          positions: [+pos1 - 1, +pos2 - 1],
        })
          ? count + 1
          : count
      }
    )

    return count
  }, 0)

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 02: Password Philosophy ---')

  return readFile('02/input.in')
    .then((data) => {
      const lines = getLines(data)
      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
