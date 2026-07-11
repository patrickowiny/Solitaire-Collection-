import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from './Game';
import { GameOptions } from './GameOptions';
import { Suit } from '~CardLib/Model/Suit';
import { Colour } from '~CardLib/Model/Colour';
import { Rank } from '~CardLib/Model/Rank';
import { Pile } from '~CardLib/Model/Pile';

describe('Freecell Game Model', () => {
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
        expect(game.freecells.length).toBe(4);
        expect(game.foundations.length).toBe(4);
        expect(game.tableaux.length).toBe(8);
        expect(game.cards.length).toBe(52);
    });

    it('should deal all 52 cards face up correctly on restart', () => {
        const restartGen = game.restart(12345);
        let result = restartGen.next();
        while (!result.done) {
            result = restartGen.next();
        }

        for (let i = 0; i < 4; ++i) {
            expect(game.tableaux[i].length).toBe(7);
        }
        for (let i = 4; i < 8; ++i) {
            expect(game.tableaux[i].length).toBe(6);
        }

        for (const card of game.cards) {
            expect(card.faceUp).toBe(true);
        }

        for (const fc of game.freecells) {
            expect(fc.length).toBe(0);
        }
        for (const fd of game.foundations) {
            expect(fd.length).toBe(0);
        }
    });

    it('should respect Freecell dragging and dropping rules', () => {
        clearAllPiles(game);

        const t0 = game.tableaux[0];
        const t1 = game.tableaux[1];
        const fc0 = game.freecells[0];

        const s7 = t0.createCard(Suit.Spades, Colour.Black, Rank.Seven);
        s7.faceUp = true;
        game.cards.push(s7);

        const h6 = t0.createCard(Suit.Hearts, Colour.Red, Rank.Six);
        h6.faceUp = true;
        game.cards.push(h6);

        expect(game.canDrag(s7).canDrag).toBe(true);
        expect(game.canDrag(s7).extraCards.length).toBe(1);
        expect(game.canDrag(s7).extraCards[0]).toBe(h6);

        const canDropFC = game.previewDrop(h6, fc0);
        expect(canDropFC).toBe(true);

        const canDropFCSeq = game.previewDrop(s7, fc0);
        expect(canDropFCSeq).toBe(false);

        fc0.push(h6);
        expect(fc0.length).toBe(1);
        expect(t0.length).toBe(1);

        expect(game.canDrag(h6).canDrag).toBe(true);
        expect(game.canDrag(h6).extraCards.length).toBe(0);

        const c2 = t1.createCard(Suit.Clubs, Colour.Black, Rank.Two);
        c2.faceUp = true;
        game.cards.push(c2);

        const canDropFCFull = game.previewDrop(c2, fc0);
        expect(canDropFCFull).toBe(false);
    });

    it('should calculate valid sequence move limits mathematically', () => {
        clearAllPiles(game);

        const t0 = game.tableaux[0];
        const t1 = game.tableaux[1];

        // Place a long valid sequence on t0
        // s8 -> h7 -> c6 -> d5 (length 4)
        const s8 = t0.createCard(Suit.Spades, Colour.Black, Rank.Eight);
        s8.faceUp = true;
        game.cards.push(s8);

        const h7 = t0.createCard(Suit.Hearts, Colour.Red, Rank.Seven);
        h7.faceUp = true;
        game.cards.push(h7);

        const c6 = t0.createCard(Suit.Clubs, Colour.Black, Rank.Six);
        c6.faceUp = true;
        game.cards.push(c6);

        const d5 = t0.createCard(Suit.Diamonds, Colour.Red, Rank.Five);
        d5.faceUp = true;
        game.cards.push(d5);

        // Place a target on t1
        const h9 = t1.createCard(Suit.Hearts, Colour.Red, Rank.Nine);
        h9.faceUp = true;
        game.cards.push(h9);

        // With 4 empty free cells and 6 other empty tableaux (excluding t0, t1),
        // maxMove = (4 + 1) * 2^6 = 320 cards. So sequence of 4 is definitely allowed.
        expect(game.previewDrop(s8, t1)).toBe(true);

        // Now fill all freecells so 0 empty freecells are left
        for (let i = 0; i < 4; ++i) {
            const fc = game.freecells[i];
            const dummy = fc.createCard(Suit.Spades, Colour.Black, Rank.Ace);
            dummy.faceUp = true;
            game.cards.push(dummy);
        }

        // Fill 6 other empty tableaux so they are not empty (tableaux 2 to 7)
        for (let i = 2; i < 8; ++i) {
            const t = game.tableaux[i];
            const dummy = t.createCard(Suit.Spades, Colour.Black, Rank.Ace);
            dummy.faceUp = true;
            game.cards.push(dummy);
        }

        // Now emptyFreeCells = 0, emptyTableaux = 0
        // maxMove = (0 + 1) * 2^0 = 1 card.
        // Moving sequence of 4 cards (s8 -> h7 -> c6 -> d5) should be disallowed!
        expect(game.previewDrop(s8, t1)).toBe(false);

        // But moving just d5 (sequence length 1) is allowed because maxMove = 1
        expect(game.previewDrop(d5, t1)).toBe(false); // wrong color anyway (Red 5 onto Red Ace dummy)

        // Let's create a black target for d5
        const s6 = t1.createCard(Suit.Spades, Colour.Black, Rank.Six);
        s6.faceUp = true;
        game.cards.push(s6);
        expect(game.previewDrop(d5, t1)).toBe(true); // Red 5 onto Black 6, length 1, maxMove = 1. Valid!
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
        fd0.push(ace);

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
