import { readFile } from '_utils/file'
import { pipe, stringToArray } from '_utils/function'

const hasOrRule = (section) => section.indexOf('|') >= 0

const breakOrRule = (value) =>
  hasOrRule(value) ? stringToArray('|')(value) : [value]

const isFinalRule = (rule) => !!rule.match(/[a-z]/)

const finalRule = (rule) => rule.match(/[a-z]/g)

const getRule = (description) =>
  breakOrRule(description).map((rule) => rule.match(/\d+/g))

const RULES = new Map()

const readRulesSection = (section) => {
  const lines = stringToArray()(section)

  lines.forEach((line) => {
    const [key, ruleDescription] = stringToArray(': ')(line)

    if (isFinalRule(ruleDescription)) {
      RULES.set(key, finalRule(ruleDescription))
    } else {
      RULES.set(key, getRule(ruleDescription))
    }
  })

  return RULES
}

const buildSingleRuleArray = (ruleNum, maxDepth = 14) => {
  const rule = RULES.get(ruleNum)

  if (typeof rule[0] === 'string' && isFinalRule(rule[0])) {
    return rule // 'a' or 'b'
  }

  return rule.map((arr) =>
    arr.map((el) =>
      maxDepth > 0 ? buildSingleRuleArray(el, maxDepth - 1) : []
    )
  )
}

const buildRuleRegExpString = (ruleArr) =>
  ruleArr.reduce((acc, v) => {
    if (typeof v === 'string') {
      return `${acc}${v}`
    }

    const internalOptions = v.reduce((acc2, v2) => {
      const subInternalOptions = buildRuleRegExpString(v2)

      return subInternalOptions.length > 0
        ? `${acc2}(${subInternalOptions})`
        : acc2
    }, '')

    return acc.length !== 0
      ? `${acc}|(${internalOptions})`
      : `(${internalOptions})`
  }, '')

const getRuleRegExp = (rulesSection) => {
  readRulesSection(rulesSection)

  const ruleArrayBuilded = buildSingleRuleArray('0')

  const ruleRegExpString = buildRuleRegExpString(ruleArrayBuilded)

  return new RegExp(`^${ruleRegExpString}$`)
}

const readMessages = (section) => stringToArray()(section)

const solve = async (sections) => {
  let result

  const [rulesSection, messagesSection] = sections

  let ruleRegExp = getRuleRegExp(rulesSection)

  const messages = readMessages(messagesSection)

  result = messages.reduce(
    (sum, message) => (ruleRegExp.test(message) ? sum + 1 : sum),
    0
  )

  console.log('> result 1:', result)

  const correctedRulesSection = '8: 42 | 42 8\n11: 42 31 | 42 11 31'

  ruleRegExp = getRuleRegExp(correctedRulesSection)

  result = messages.reduce(
    (sum, message) => (ruleRegExp.test(message) ? sum + 1 : sum),
    0
  )

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 19: Monster Messages ---')

  return readFile('19/input.in')
    .then((data) => {
      const sections = pipe(stringToArray('\n\n'))(data)

      solve(sections)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
