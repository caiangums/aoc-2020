import { readFile } from '_utils/file'
import { pipe, stringToArray, sliceArray, toNumberArray } from '_utils/function'

const createPlayers = (decks) =>
  decks.map((deck) => pipe(stringToArray(), sliceArray(1), toNumberArray)(deck))

const isOver = (...players) => players.filter((p) => p.length > 0).length === 1

const getScore = (player) =>
  player.reduce((acc, val, i) => acc + val * (player.length - i), 0)

const playGame = (player1, player2) => {
  if (!isOver(player1, player2)) {
    const [p1card, p2card] = [player1.shift(), player2.shift()]

    return p1card > p2card
      ? playGame([...player1, p1card, p2card], player2)
      : playGame(player1, [...player2, p2card, p1card])
  }

  return player1.length > 0 ? player1 : player2
}

/**
 * [NOTE]: avoid recursion = avoid errors with max call stack
 *
 * The solution should work with recursion but keeps exceeding stack
 * call size :shrug:
 */
const playRecursiveGame = (player1, player2) => {
  const roundSets = new Set()

  const internalPlay = (p1, p2) => {
    // infinite loop check
    if (roundSets.has(`${p1}-${p2}`)) {
      return [p1, []] // => [win1, win2]
    }
    roundSets.add(`${p1}-${p2}`)

    // check for empty decks
    if (isOver(p1, p2)) {
      return [p1, p2] // => [win1, win2]
    }

    // draw cards
    const p1card = p1.shift()
    const p2card = p2.shift()

    // can play another sub-game
    if (p1.length >= p1card && p2.length >= p2card) {
      const [win1] = playRecursiveGame(p1.slice(0, p1card), p2.slice(0, p2card)) // => [win1, win2]

      return win1.length > 0
        ? [[...p1, p1card, p2card], p2]
        : [p1, [...p2, p2card, p1card]]
    }

    // highest card value wins
    return p1card > p2card
      ? [[...p1, p1card, p2card], p2]
      : [p1, [...p2, p2card, p1card]]
  }

  let rPlayers = internalPlay(player1, player2)

  while (!rPlayers.find((p) => p.length === 0)) {
    rPlayers = internalPlay(...rPlayers)
  }

  return rPlayers
}

const solve = async (playerDecks) => {
  let [player1, player2] = createPlayers(playerDecks)

  let winner = playGame(player1, player2)

  let result = getScore(winner)

  console.log('> result 1:', result)

  let [recursivePlayer1, recursivePlayer2] = createPlayers(playerDecks)

  let [r1, r2] = playRecursiveGame(recursivePlayer1, recursivePlayer2)

  winner = r1.length > 0 ? r1 : r2

  result = getScore(winner)

  console.log('> result 2:', result)
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
