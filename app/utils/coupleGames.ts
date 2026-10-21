export type MemoryCard = { id: number; pair: number; symbol: string; image?: string }
export type MemoryGame = {
  cards: MemoryCard[]
  flipped: number[]
  matched: number[]
  scores: [number, number]
  player: 0 | 1
  moves: number
}

export function createMemoryGame(images: string[] = [], random = Math.random): MemoryGame {
  const symbols = ['🌷', '🍓', '🌙', '💌', '🧸', '🌻']
  const cards = symbols.flatMap((symbol, pair) => [
    { id: pair * 2, pair, symbol, image: images[pair] },
    { id: pair * 2 + 1, pair, symbol, image: images[pair] },
  ])
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j]!, cards[i]!]
  }
  return { cards, flipped: [], matched: [], scores: [0, 0], player: 0, moves: 0 }
}

export function flipMemoryCard(game: MemoryGame, id: number): MemoryGame {
  if (game.flipped.length === 2 || game.flipped.includes(id) || game.matched.includes(id)) return game
  const card = game.cards.find(item => item.id === id)
  if (!card) return game
  const flipped = [...game.flipped, id]
  if (flipped.length < 2) return { ...game, flipped }
  const first = game.cards.find(item => item.id === flipped[0])!
  if (first.pair !== card.pair) return { ...game, flipped, moves: game.moves + 1 }
  const scores: [number, number] = [...game.scores]
  scores[game.player] += 1
  return { ...game, flipped: [], matched: [...game.matched, ...flipped], scores, moves: game.moves + 1 }
}

export function nextMemoryTurn(game: MemoryGame): MemoryGame {
  if (game.flipped.length !== 2) return game
  return { ...game, flipped: [], player: game.player === 0 ? 1 : 0 }
}
