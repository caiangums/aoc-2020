import { readFile } from '_utils/file'
import { pipe, stringToArray } from '_utils/function'

const parseIngredientsAndAllergens = (lines) =>
  lines.map((line) => {
    let ingredients = ''
    let allergens = ''

    line.replace(/([a-z ]+) \(contains ([a-z, ]+)\)/g, (_match, ingr, alle) => {
      ingredients = ingr.split(' ')
      allergens = alle.split(', ')
    })

    return [ingredients, allergens]
  })

const getAllIngredients = (tuples) =>
  tuples.reduce(
    (ingredients, tuple) => [
      ...ingredients,
      ...tuple[0].filter((ingr) => !ingredients.includes(ingr)),
    ],
    []
  )

const getAllAllergens = (tuples) =>
  tuples.reduce(
    (allergens, tuple) => [
      ...allergens,
      ...tuple[1].filter((alle) => !allergens.includes(alle)),
    ],
    []
  )

const findAllergensIngredients = ({
  allergensList,
  ingredientsAllergensTuples,
  ingredientsList,
}) =>
  allergensList.map((allergen) => [
    allergen,
    ingredientsAllergensTuples.reduce(
      (found, [ingr, alle]) =>
        !alle.includes(allergen)
          ? found
          : ingr.filter((a) => found.includes(a)),
      ingredientsList
    ),
  ])

const findUniqueIngredientsForAllergens = (ingredientsWithAllergen) => {
  let search = ingredientsWithAllergen
  let found = []

  while (found.length < search.length) {
    search.forEach(([alle, ingr]) => {
      if (ingr.length === 1 && !found.some(([a]) => a === alle)) {
        found.push([alle, ingr])
      }
    })

    found.forEach(([alle, ingr]) => {
      search = search.map(([inAlle, inIngr]) =>
        alle === inAlle
          ? [inAlle, inIngr]
          : [inAlle, inIngr.filter((item) => !ingr.includes(item))]
      )
    })
  }

  return found
}

const countIngredientsNonAllergens = ({
  ingredientsAllergensTuples,
  allergensIngredientsList,
}) =>
  ingredientsAllergensTuples.reduce(
    (arr, [ingr]) => [
      ...arr,
      ...ingr.filter((item) => !allergensIngredientsList.includes(item)),
    ],
    []
  ).length

const getAllergensOrdered = (unigueIngredientsForAllergens) =>
  unigueIngredientsForAllergens
    .map(([alle]) => alle)
    .sort()
    .map((alle) => unigueIngredientsForAllergens.find(([a]) => a === alle)[1])
    .join(',')

const solve = async (lines) => {
  let result

  const ingredientsAllergensTuples = parseIngredientsAndAllergens(lines)

  const ingredientsList = getAllIngredients(ingredientsAllergensTuples)

  const allergensList = getAllAllergens(ingredientsAllergensTuples)

  const ingredientsWithAllergen = findAllergensIngredients({
    allergensList,
    ingredientsAllergensTuples,
    ingredientsList,
  })

  const unigueIngredientsForAllergens = findUniqueIngredientsForAllergens(
    ingredientsWithAllergen
  )

  const allergensIngredientsList = unigueIngredientsForAllergens.map(
    ([, ingr]) => ingr[0]
  )

  result = countIngredientsNonAllergens({
    ingredientsAllergensTuples,
    allergensIngredientsList,
  })

  console.log('> result 1:', result)

  result = getAllergensOrdered(unigueIngredientsForAllergens)

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 21: Allergen Assessment ---')

  return readFile('21/input.in')
    .then((data) => {
      const lines = pipe(stringToArray())(data)

      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
