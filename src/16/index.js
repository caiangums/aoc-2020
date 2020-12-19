import { readFile } from '_utils/file'
import { pipe, stringToArray, toNumberArray } from '_utils/function'

const isSingleElement = (arr) => arr.length === 1

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

const getNonMessyTickets = ({ tickets, fieldAndRules }) =>
  tickets.filter((ticket) => ticketErrorRate({ ticket, fieldAndRules }) === 0)

const generateFieldsOrderStartingArray = (fieldAndRules) => {
  const fieldAndRulesIterator = fieldAndRules.keys()
  let fieldNameIterator = fieldAndRulesIterator.next()

  let fieldsArr = []

  while (!fieldNameIterator.done) {
    if (fieldNameIterator.value) {
      fieldsArr.push(fieldNameIterator.value)
    }

    fieldNameIterator = fieldAndRulesIterator.next()
  }

  return fieldsArr.map(() => fieldsArr)
}

const getOptionsSum = (fieldsOrder) =>
  fieldsOrder.reduce((sum, fields) => sum + fields.length, 0)

const getAlreadyFoundFieldsOrder = (fieldsOrder) =>
  fieldsOrder.reduce(
    (found, fields) =>
      isSingleElement(fields) ? [...found, fields[0]] : found,
    []
  )

const getInitialFieldsOrder = ({ nonMessyTickets, fieldAndRules }) =>
  nonMessyTickets.reduce(
    (fieldsOrder, ticket) =>
      ticket.map((num, i) =>
        fieldsOrder[i].filter((field) => fieldAndRules.get(field)(num))
      ),
    generateFieldsOrderStartingArray(fieldAndRules)
  )

const getFieldsOrder = (initialFieldsOrder) => {
  let fieldsOrder = initialFieldsOrder

  const foundFields = getAlreadyFoundFieldsOrder(fieldsOrder)

  let lastFoundOptions = getOptionsSum(fieldsOrder)
  let actualFoundOptions = 0

  while (lastFoundOptions !== actualFoundOptions) {
    actualFoundOptions = lastFoundOptions

    fieldsOrder = fieldsOrder.map((fields) => {
      if (isSingleElement(fields)) {
        if (!foundFields.includes(fields[0])) {
          foundFields.push(fields[0])
        }
        return fields
      }

      const actualFound = fields.filter((field) => !foundFields.includes(field))

      if (
        isSingleElement(actualFound) &&
        !foundFields.includes(actualFound[0])
      ) {
        foundFields.push(actualFound[0])
      }

      return actualFound
    })

    lastFoundOptions = getOptionsSum(fieldsOrder)
  }

  return fieldsOrder
}

const DESIRED_VALUES = [
  'departure location',
  'departure station',
  'departure platform',
  'departure track',
  'departure date',
  'departure time',
]

const getMultipliedDesiredValues = ({ myTicket, fieldsOrder }) =>
  fieldsOrder.reduce(
    (mult, field, i) =>
      field.length > 0 && DESIRED_VALUES.includes(field[0])
        ? mult * myTicket[i]
        : mult,
    1
  )

const solve = async (sections) => {
  let result

  const fieldAndRules = readFieldsAndRules(sections[0])

  const tickets = readNearbyTickets(sections[2])

  result = getErrorRate({
    tickets: tickets,
    fieldAndRules,
  })

  console.log('> result 1:', result)

  const nonMessyTickets = getNonMessyTickets({ tickets, fieldAndRules })

  const initialFieldsOrder = getInitialFieldsOrder({
    nonMessyTickets,
    fieldAndRules,
  })

  const fieldsOrder = getFieldsOrder(initialFieldsOrder)

  const myTicket = readMyTicket(sections[1])

  result = getMultipliedDesiredValues({ myTicket, fieldsOrder })

  console.log('> result 2:', result)
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
