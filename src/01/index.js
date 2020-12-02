import { readFile } from '_utils/file'

const convertValuesToNumbers = (values) =>
  values.reduce(
    (acc, value) => (Number(value) ? [...acc, Number(value)] : acc),
    []
  )

const solve = (numbers) => {
  let result

  numbers.some((firstNumber, i) =>
    numbers.slice(i + 1).some((secondNumber) => {
      if (firstNumber + secondNumber === 2020) {
        result = firstNumber * secondNumber
        return true
      }

      return false
    })
  )

  console.log('> result 1:', result)

  numbers.some((firstNumber, i) =>
    numbers.slice(i + 1).some((secondNumber, j) =>
      numbers.slice(j + 1).some((thirdNumber) => {
        if (firstNumber + secondNumber + thirdNumber === 2020) {
          result = firstNumber * secondNumber * thirdNumber
          return true
        }

        return false
      })
    )
  )

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 01: Report Repair ---')

  return readFile('01/input.in')
    .then((data) => {
      const numbers = convertValuesToNumbers(data.split('\n'))
      solve(numbers)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
