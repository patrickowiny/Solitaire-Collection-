import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from './Game';
import { GameOptions } from './GameOptions';
import { Suit } from '~CardLib/Model/Suit';
import { Colour } from '~CardLib/Model/Colour';
import { Rank } from '~CardLib/Model/Rank';
import { Pile } from '~CardLib/Model/Pile';

describe('KingAlbert Game Model', () => {
    let game: Game;

    const clearAllPiles = (g: Game) => {
        g.cards = [];
        const tempPile = new Pile(g);
        for (const p of g.piles) {
            while (p.length > 0) {
                tempPile.push(p.peek()!);
            }
        }
    };

    beforeEach(() => {
        const params = new URLSearchParams('autoMoveToFoundation=0');
        game = new Game(new GameOptions(params));
    });

    it('should initialize correctly', () => {
        expect(game.tableaux.length).toBe(9);
        expect(game.foundations.length).toBe(4);
        expect(game.reserves.length).toBe(7);
        expect(game.cards.length).toBe(52);
    });

    it('should deal all 52 cards face up correctly on restart', () => {
        const restartGen = game.restart(12345);
        let result = restartGen.next();
        while (!result.done) {
            result = restartGen.next();
        }

        // tableaux: 1, 2, ... 9 cards fanned face up
        for (let i = 0; i < 9; ++i) {
            expect(game.tableaux[i].length).toBe(i + 1);
        }

        for (const card of game.cards) {
            expect(card.faceUp).toBe(true);
        }

        // reserves: 7 cards face up individually fanned
        for (let i = 0; i < 7; ++i) {
            expect(game.reserves[i].length).toBe(1);
        }

        for (const fd of game.foundations) {
            expect(fd.length).toBe(0);
        }
    });

    it('should respect KingAlbert dragging and dropping rules', () => {
        clearAllPiles(game);

        const t0 = game.tableaux[0];
        const t1 = game.tableaux[1];
        const res0 = game.reserves[0];

        // KH on t0
        const kh = t0.createCard(Suit.Hearts, Colour.Red, Rank.King);
        kh.faceUp = true;
        game.cards.push(kh);

        // QS on t1
        const qs = t1.createCard(Suit.Spades, Colour.Black, Rank.Queen);
        qs.faceUp = true;
        game.cards.push(qs);

        // QH on res0
        const qh = res0.createCard(Suit.Hearts, Colour.Red, Rank.Queen);
        qh.faceUp = true;
        game.cards.push(qh);

        // Only top card may drag
        expect(game.canDrag(kh).canDrag).toBe(true);
        expect(game.canDrag(qs).canDrag).toBe(true);
        expect(game.canDrag(qh).canDrag).toBe(true);

        // Drop QS (black queen) on KH (red king) - valid alternated color, descending rank
        expect(game.previewDrop(qs, t0)).toBe(true);

        // Drop QH (red queen) on KH (red king) - invalid (same color)
        expect(game.previewDrop(qh, t0)).toBe(false);

        // Move QS to t0 (on top of KH)
        const dropGen = game.dropCard(qs, t0);
        let dResult = dropGen.next();
        while (!dResult.done) {
            dResult = dropGen.next();
        }

        expect(t0.length).toBe(2);
        expect(t0.peek()).toBe(qs);

        // Since only one card may move at a time, we should NOT be able to drag KH now because it is not top card
        expect(game.canDrag(kh).canDrag).toBe(false);
    });

    it('should support dropping of Aces and building up foundations', () => {
        clearAllPiles(game);

        const t0 = game.tableaux[0];
        const fd0 = game.foundations[0];

        const ace = t0.createCard(Suit.Hearts, Colour.Red, Rank.Ace);
        ace.faceUp = true;
        game.cards.push(ace);

        // Can drop Ace to empty foundation
        expect(game.previewDrop(ace, fd0)).toBe(true);

        // Move it
        const dropGen = game.dropCard(ace, fd0);
        let dResult = dropGen.next();
        while (!dResult.done) {
            dResult = dropGen.next();
        }

        // Hearts Two can build on top of Hearts Ace
        const h2 = t0.createCard(Suit.Hearts, Colour.Red, Rank.Two);
        h2.faceUp = true;
        game.cards.push(h2);
        expect(game.previewDrop(h2, fd0)).toBe(true);

        // Diamonds Two cannot build on Hearts Ace
        const d2 = t0.createCard(Suit.Diamonds, Colour.Red, Rank.Two);
        d2.faceUp = true;
        game.cards.push(d2);
        expect(game.previewDrop(d2, fd0)).toBe(false);
    });

    it('should reach won condition when all 52 cards are in foundations', () => {
        expect(game.won).toBe(false);

        // Fill foundations with 52 cards (13 each)
        for (let f = 0; f < 4; ++f) {
            const fd = game.foundations[f];
            const suit = [Suit.Spades, Suit.Hearts, Suit.Diamonds, Suit.Clubs][f]!;
            const colour = [Colour.Black, Colour.Red, Colour.Red, Colour.Black][f]!;
            const ranks = [
                Rank.Ace, Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six,
                Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King
            ];
            for (const r of ranks) {
                const card = fd.createCard(suit, colour, r);
                card.faceUp = true;
            }
        }

        // Trigger win evaluation
        expect((game as any).doGetWon_()).toBe(true);
    });
});
