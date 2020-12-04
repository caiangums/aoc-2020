import { readFile } from '_utils/file'

const getPassports = (data) => data.split('\n\n')

const NEEDED_FIELDS = new Set(['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid'])

const isValidValue = ({ value, min, max }) => value >= min && value <= max

const isValidYear = ({ value, min, max }) =>
  value.length === 4 && isValidValue({ value: +value, min, max })

const isValidHeight = (value) => {
  if (value.length < 4 || value.lenght > 5) {
    return false
  }

  const [numericValue] = value.match(/\d{2,3}/)
  const [metric] = value.match(/cm|in/)
  if (metric === 'cm') {
    return isValidValue({ value: +numericValue, min: 150, max: 193 })
  }

  if (metric === 'in') {
    return isValidValue({ value: +numericValue, min: 59, max: 76 })
  }

  return false
}

const EYE_COLORS = ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth']

const isValueValidByField = ({ name, value }) => {
  switch (name) {
    case 'byr': {
      return isValidYear({ value, min: 1920, max: 2002 })
    }
    case 'iyr': {
      return isValidYear({ value, min: 2010, max: 2020 })
    }
    case 'eyr': {
      return isValidYear({ value, min: 2020, max: 2030 })
    }
    case 'hgt': {
      return isValidHeight(value)
    }
    case 'hcl': {
      if (value.charAt(0) === '#' && value.length === 7) {
        const [color] = value.match(/(\d|[a-f]){6}/)

        return color.length === 6
      }

      return false
    }
    case 'ecl': {
      return EYE_COLORS.includes(value)
    }
    case 'pid': {
      return value.length === 9
    }
    default: {
      return false
    }
  }
}

const isFieldValid = (field) => {
  const [name, value] = field.split(':')

  return NEEDED_FIELDS.has(name) && isValueValidByField({ name, value })
}

const isPassportValid = (passport) => {
  const fields = passport.match(/(\w*):((\w|\d|#)*)/g)

  const validPassportFields = fields.reduce(
    (validFields, field) =>
      isFieldValid(field) ? validFields + 1 : validFields,
    0
  )

  return validPassportFields === NEEDED_FIELDS.size
}

const isPassportWithValidFields = (passport) => {
  const fields = passport.match(/(\w*):(\w*)/g)

  const validPassportFields = fields.reduce((validFields, field) => {
    const [fieldName] = field.split(':')

    return NEEDED_FIELDS.has(fieldName) ? validFields + 1 : validFields
  }, 0)

  return validPassportFields === NEEDED_FIELDS.size
}

const solve = (passports) => {
  let result = passports.reduce(
    (validPassports, passport) =>
      isPassportWithValidFields(passport) ? validPassports + 1 : validPassports,
    0
  )

  console.log('> result 1:', result)

  result = passports.reduce(
    (validPassports, passport) =>
      isPassportValid(passport) ? validPassports + 1 : validPassports,
    0
  )

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 04: Passport Processing ---')

  return readFile('04/input.in')
    .then((data) => {
      const passports = getPassports(data)
      solve(passports)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
