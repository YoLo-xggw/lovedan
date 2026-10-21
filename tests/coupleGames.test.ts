import { describe, expect, it } from 'vitest'
import { createMemoryGame, flipMemoryCard, nextMemoryTurn } from '../app/utils/coupleGames'

describe('couple memory game', () => {
  it('blocks duplicate flips and a third flip until a missed pair is handed over', () => {
    let game = createMemoryGame()
    const first = game.cards[0]!
    const different = game.cards.find(card => card.pair !== first.pair)!
    game = flipMemoryCard(game, first.id)
    expect(flipMemoryCard(game, first.id)).toBe(game)
    game = flipMemoryCard(game, different.id)
    expect(game.moves).toBe(1)
    expect(game.scores).toEqual([0, 0])
    expect(flipMemoryCard(game, game.cards.find(card => !game.flipped.includes(card.id))!.id)).toBe(game)
    const next = nextMemoryTurn(game)
    expect(next.player).toBe(1)
    expect(next.flipped).toEqual([])
    expect(game.flipped).toHaveLength(2)
  })

  it('awards each pair once, retains the turn on a match, and can finish all six pairs', () => {
    let game = createMemoryGame(['photo-a'])
    expect(game.cards.filter(card => card.image === 'photo-a')).toHaveLength(2)
    expect(nextMemoryTurn(game)).toBe(game)
    for (let pair = 0; pair < 6; pair++) {
      const cards = game.cards.filter(card => card.pair === pair)
      game = flipMemoryCard(flipMemoryCard(game, cards[0]!.id), cards[1]!.id)
      expect(game.player).toBe(0)
      expect(game.scores).toEqual([pair + 1, 0])
      expect(flipMemoryCard(game, cards[0]!.id)).toBe(game)
    }
    expect(game.matched).toHaveLength(12)
    expect(game.moves).toBe(6)
  })

  it('credits a match after handover to the second player', () => {
    let game = createMemoryGame()
    game = nextMemoryTurn(flipMemoryCard(flipMemoryCard(game, 0), 2))
    game = flipMemoryCard(flipMemoryCard(game, 0), 1)
    expect(game.scores).toEqual([0, 1])
    expect(game.player).toBe(1)
  })
})
