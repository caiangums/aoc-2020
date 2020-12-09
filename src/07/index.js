import { readFile, getLinesFromFile } from '_utils/file'
import { isArrayEmpty } from '_utils/validate'
import { Graph } from '_data-structures/graph'

function BagGraph() {
  const graph = Graph()

  const _checkPossibleUniqueBagsThatContains = (fromBag, foundBags) =>
    graph
      .getEdges()
      .filter(
        (edge) => edge.fromVertice === fromBag && foundBags.add(edge.toVertice)
      )
      .forEach((edge) =>
        _checkPossibleUniqueBagsThatContains(edge.toVertice, foundBags)
      )

  const checkPossibleUniqueBagsThatContains = (fromBag) => {
    const foundBags = new Set()

    _checkPossibleUniqueBagsThatContains(fromBag, foundBags)

    return foundBags.size
  }

  const findBagsAndVertices = ({ fromBag, edges }) => {
    const foundBags = new Map()

    edges.forEach(
      (edge) =>
        edge.toVertice === fromBag &&
        foundBags.set(edge.fromVertice, edge.weight)
    )

    return { foundBagsVertices: [...foundBags.keys()], foundBags }
  }

  const checkMaxContainingBags = (
    fromBag,
    edges = graph.getEdges(),
    carry = 0
  ) => {
    const { foundBagsVertices, foundBags } = findBagsAndVertices({
      edges,
      fromBag,
    })

    return isArrayEmpty(foundBagsVertices)
      ? 1
      : foundBagsVertices.reduce(
          (sum, newFromBag) =>
            sum +
            foundBags.get(newFromBag) *
              checkMaxContainingBags(newFromBag, edges, 1),
          carry
        )
  }

  return {
    addEdge: graph.addEdge,
    addVertice: graph.addVertice,
    checkPossibleUniqueBagsThatContains,
    checkMaxContainingBags,
  }
}

const getBagName = (bag) => bag.slice(0, -1)

const parsePossibleBags = (possibleBags) => possibleBags.match(/\d* (\w*| )*/g)

const fillBagGraphWithBags = ({ containedBags, actualBag, graph }) =>
  containedBags.replace(/ ?(\d*) ((\w* |bag)*)/g, (_match, num, fullBagName) =>
    graph.addEdge({
      fromVertice: fullBagName,
      toVertice: getBagName(actualBag),
      weight: +num,
    })
  )

const SMALLEST_BAG = 'no other bags.'

const populageBagGraph = ({ line, graph }) => {
  const [actualBag, possibleBags] = line.split(' contain ')

  if (possibleBags !== SMALLEST_BAG) {
    parsePossibleBags(possibleBags).forEach((containedBags) =>
      fillBagGraphWithBags({ containedBags, actualBag, graph })
    )
  }
}

const bagGraph = BagGraph()

const solve = (lines) => {
  lines.forEach((line) => populageBagGraph({ line, graph: bagGraph }))

  const desiredBag = 'shiny gold bag'
  let result = bagGraph.checkPossibleUniqueBagsThatContains(desiredBag)

  console.log('> result 1:', result)

  result = bagGraph.checkMaxContainingBags(desiredBag)

  console.log('> result 2:', result)
}

export default () => {
  console.log('--- Day 07: Handy Haversacks ---')

  return readFile('07/input.in')
    .then((data) => {
      const lines = getLinesFromFile(data)
      solve(lines)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
