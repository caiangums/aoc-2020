export function Graph() {
  const vertices = new Set()

  const edges = []

  const addVertice = (vertice) => {
    vertices.add(vertice)
  }

  const edgeAlreadyAdded = ({ fromVertice, toVertice }) =>
    edges.some(
      (edge) => edge.fromVertice === fromVertice && edge.toVertice === toVertice
    )

  const addEdge = ({ fromVertice, toVertice, weight }) => {
    if (edgeAlreadyAdded({ fromVertice, toVertice })) {
      throw new Error('Edge already added')
    }

    addVertice(fromVertice)
    addVertice(toVertice)

    edges.push({ fromVertice, toVertice, weight })
  }

  const getEdges = () => edges

  const getVertices = () => vertices

  return {
    addVertice,
    addEdge,
    getEdges,
    getVertices,
  }
}
