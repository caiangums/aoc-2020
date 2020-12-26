import { readFile } from '_utils/file'
import { pipe, stringToArray, sliceArray, toNumberArray } from '_utils/function'

function Player(startingDeck) {
  let deck = startingDeck

  const draw = () => deck.shift()

  const winRound = (...cards) => deck.push(...cards)

  const isDeckEmpty = () => deck.length === 0

  const getScore = () =>
    deck.reduce((acc, val, i) => acc + val * (deck.length - i), 0)

  return {
    draw,
    winRound,
    isDeckEmpty,
    getScore,
  }
}

function Game(startingPlayers) {
  let players = startingPlayers

  const executeRound = () => {
    const orderedDrawnCards = players
      .reduce((acc, player, i) => [...acc, [i, player.draw()]], [])
      .sort((a, b) => b[1] - a[1])

    const winnerPlayerIndex = orderedDrawnCards[0][0]

    const roundCards = orderedDrawnCards.map((cardTuple) => cardTuple[1])

    players[winnerPlayerIndex].winRound(...roundCards)
  }

  const isGameOver = () =>
    players.filter((player) => !player.isDeckEmpty()).length === 1

  const getWinnerPlayer = () => players.find((player) => !player.isDeckEmpty())

  const getWinnerScore = () => {
    if (isGameOver()) {
      const winner = getWinnerPlayer()

      return winner.getScore()
    }

    return 0
  }

  return {
    executeRound,
    isGameOver,
    getWinnerScore,
  }
}

const createPlayers = (decks) =>
  decks.map((deck) =>
    pipe(stringToArray(), sliceArray(1), toNumberArray, Player)(deck)
  )

const solve = async (playerDecks) => {
  let result

  const players = createPlayers(playerDecks)

  const game = Game(players)

  while (!game.isGameOver()) {
    game.executeRound()
  }

  result = game.getWinnerScore()

  console.log('> result 1:', result)
}

export default () => {
  console.log('--- Day 22: Crab Combat ---')

  return readFile('22/input.in')
    .then((data) => {
      const playerDecks = pipe(stringToArray('\n\n'))(data)

      solve(playerDecks)
    })
    .catch((err) => {
      console.error('Error:', err)
    })
}
