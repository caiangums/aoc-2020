import { readFile } from '_utils/file'
import { pipe, stringToArray, toNumberArray } from '_utils/function'

const ruleCallback = (args) => (value) =>
  args.reduce(
    (acc, [low, high]) => acc || (value >= low && value <= high),
    false
  )

const getLineFieldAndRule = (line) => {
  let field,
    validationArgs = []

  line.replace(
    /([\w ]*): (\d+)-(\d+) or (\d+)-(\d+)/g,
    (_match, f, a1, a2, a3, a4) => {
      field = f
      validationArgs = [
        [+a1, +a2],
        [+a3, +a4],
      ]
    }
  )

  return {
    field,
    rule: (value) => ruleCallback(validationArgs)(value),
  }
}

const readFieldsAndRules = (section) => {
  const lines = stringToArray()(section)

  const fieldsAndRules = new Map()

  return lines.reduce((acc, line) => {
    const { field, rule } = getLineFieldAndRule(line)

    acc.set(field, rule)

    return acc
  }, fieldsAndRules)
}

const readTicket = (line) => pipe(stringToArray(','), toNumberArray)(line)

const readMyTicket = (section) => {
  const [, ticketNums] = stringToArray()(section)

  return readTicket(ticketNums)
}

const readNearbyTickets = (section) =>
  stringToArray()(section)
    .slice(1)
    .reduce((acc, line) => [...acc, readTicket(line)], [])

const ticketErrorRate = ({ ticket, fieldAndRules }) =>
  ticket.reduce((acc, num) => {
    const fieldAndRulesIterator = fieldAndRules.values()
    let ruleIterator = fieldAndRulesIterator.next()

    while (!ruleIterator.done) {
      if (ruleIterator.value(num)) {
        return acc
      }

      ruleIterator = fieldAndRulesIterator.next()
    }

    return acc + num
  }, 0)

const getErrorRate = ({ tickets, fieldAndRules }) =>
  tickets.reduce(
    (errorRate, ticket) =>
      errorRate + ticketErrorRate({ ticket, fieldAndRules }),
    0
  )

const solve = (sections) => {
  let result

  const fieldAndRules = readFieldsAndRules(sections[0])

  const tickets = readNearbyTickets(sections[2])

  result = getErrorRate({
    tickets: tickets,
    fieldAndRules,
  })

  console.log('> result 1:', result)

  const myTicket = readMyTicket(sections[1])

  console.log('> result 2:', myTicket)
}

export default () => {
  console.log('--- Day 16: Ticket Translation ---')

  return readFile('16/input.in')
    .then((data) => {
      const sections = pipe(stringToArray('\n\n'))(data)
      solve(sections)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
