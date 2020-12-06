import { readFile } from '_utils/file'

const getGroupAnswers = (data) => data.split('\n\n')

const intersectionBetween = ({ a, b }) =>
  new Set([...a].filter((value) => b.has(value)))

const getSetFrom = (str) => new Set(str.split(''))

const FULL_ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

const getStartingSet = () => getSetFrom(FULL_ALPHABET)

const getGroupAnswersCount = (singleGroup) => {
  const answers = getSetFrom(singleGroup)

  return answers.has('\n') ? answers.size - 1 : answers.size
}

const getGroupAnswersInCommonCount = (singleGroup) => {
  const peopleAnswers = singleGroup.split('\n')

  const answers = peopleAnswers.reduce(
    (recurrent, personAnswer) =>
      intersectionBetween({
        a: recurrent,
        b: getSetFrom(personAnswer),
      }),
    getStartingSet()
  )

  return answers.size
}

const solve = (groupAnswers) => {
  let result = groupAnswers.reduce(
    (sum, singleGroup) => sum + getGroupAnswersCount(singleGroup),
    0
  )

  console.log('> result 1:', result)

  result = groupAnswers.reduce(
    (sum, singleGroup) => sum + getGroupAnswersInCommonCount(singleGroup),
    0
  )

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 06: Custom Customs ---')

  return readFile('06/input.in')
    .then((data) => {
      const groupAnswers = getGroupAnswers(data)
      solve(groupAnswers)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
