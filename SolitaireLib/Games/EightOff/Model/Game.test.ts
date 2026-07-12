import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from './Game';
import { GameOptions } from './GameOptions';
import { Suit } from '~CardLib/Model/Suit';
import { Colour } from '~CardLib/Model/Colour';
import { Rank } from '~CardLib/Model/Rank';
import { Pile } from '~CardLib/Model/Pile';

describe('Eight Off Game Model', () => {
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
        expect(game.cells.length).toBe(8);
        expect(game.foundations.length).toBe(4);
        expect(game.tableaux.length).toBe(8);
        expect(game.cards.length).toBe(52);
    });

    it('should deal cards correctly on restart', () => {
        const restartGen = game.restart(12345);
        let result = restartGen.next();
        while (!result.done) {
            result = restartGen.next();
        }

        // Deal 48 cards face up into 8 tableau columns of 6 cards each.
        for (let i = 0; i < 8; ++i) {
            expect(game.tableaux[i].length).toBe(6);
        }

        // Deal the remaining 4 cards, one each, into 4 of the 8 cells (the other 4 start empty).
        for (let i = 0; i < 4; ++i) {
            expect(game.cells[i].length).toBe(1);
        }
        for (let i = 4; i < 8; ++i) {
            expect(game.cells[i].length).toBe(0);
        }

        for (const card of game.cards) {
            expect(card.faceUp).toBe(true);
        }

        for (const fd of game.foundations) {
            expect(fd.length).toBe(0);
        }
    });

    it('should respect Eight Off dragging and dropping rules (build down by suit)', () => {
        clearAllPiles(game);

        const t0 = game.tableaux[0];
        const t1 = game.tableaux[1];
        const c0 = game.cells[0];

        const s7 = t0.createCard(Suit.Spades, Colour.Black, Rank.Seven);
        s7.faceUp = true;
        game.cards.push(s7);

        const s6 = t0.createCard(Suit.Spades, Colour.Black, Rank.Six);
        s6.faceUp = true;
        game.cards.push(s6);

        // s6 must be on top of s7 (same suit, builds down)
        expect(game.canDrag(s7).canDrag).toBe(true);
        expect(game.canDrag(s7).extraCards.length).toBe(1);
        expect(game.canDrag(s7).extraCards[0]).toBe(s6);

        // Try putting a heart 6 onto spade 7 - invalid because it has to build down by suit only!
        const h6 = t1.createCard(Suit.Hearts, Colour.Red, Rank.Six);
        h6.faceUp = true;
        game.cards.push(h6);
        expect(game.previewDrop(h6, t0)).toBe(false);

        // Can drop single s6 to empty cell
        const canDropCell = game.previewDrop(s6, c0);
        expect(canDropCell).toBe(true);

        // Cannot drop spade 7 sequence to cell
        const canDropCellSeq = game.previewDrop(s7, c0);
        expect(canDropCellSeq).toBe(false);

        c0.push(s6);
        expect(c0.length).toBe(1);
        expect(t0.length).toBe(1);

        expect(game.canDrag(s6).canDrag).toBe(true);
        expect(game.canDrag(s6).extraCards.length).toBe(0);

        // Cannot drop spade 7 onto heart 6 in cell (cell is full anyway, and cells hold max 1 card)
        expect(game.previewDrop(s7, c0)).toBe(false);
    });

    it('should calculate valid sequence move limits mathematically', () => {
        clearAllPiles(game);

        const t0 = game.tableaux[0];
        const t1 = game.tableaux[1];
        const t2 = game.tableaux[2];

        // Place a long same-suit descending sequence on t0: s8 -> s7 -> s6 -> s5 (length 4)
        const s8 = t0.createCard(Suit.Spades, Colour.Black, Rank.Eight);
        s8.faceUp = true;
        game.cards.push(s8);

        const s7 = t0.createCard(Suit.Spades, Colour.Black, Rank.Seven);
        s7.faceUp = true;
        game.cards.push(s7);

        const s6 = t0.createCard(Suit.Spades, Colour.Black, Rank.Six);
        s6.faceUp = true;
        game.cards.push(s6);

        const s5 = t0.createCard(Suit.Spades, Colour.Black, Rank.Five);
        s5.faceUp = true;
        game.cards.push(s5);

        // Place a target on t1 (Spade Nine)
        const s9 = t1.createCard(Suit.Spades, Colour.Black, Rank.Nine);
        s9.faceUp = true;
        game.cards.push(s9);

        // Place a target on t2 (Spade Six)
        const s6Target = t2.createCard(Suit.Spades, Colour.Black, Rank.Six);
        s6Target.faceUp = true;
        game.cards.push(s6Target);

        // With 8 empty cells and 5 other empty tableaux,
        // maxMove = emptyCells + emptyTableaux + 1 = 8 + 5 + 1 = 14.
        // Sequence of 4 is definitely allowed on t1.
        expect(game.previewDrop(s8, t1)).toBe(true);

        // Fill all 8 cells
        for (let i = 0; i < 8; ++i) {
            const cell = game.cells[i];
            const dummy = cell.createCard(Suit.Spades, Colour.Black, Rank.Ace);
            dummy.faceUp = true;
            game.cards.push(dummy);
        }

        // Fill 5 other tableaux (tableaux 3 to 7) so they are not empty
        for (let i = 3; i < 8; ++i) {
            const t = game.tableaux[i];
            const dummy = t.createCard(Suit.Spades, Colour.Black, Rank.Ace);
            dummy.faceUp = true;
            game.cards.push(dummy);
        }

        // Now emptyCells = 0, emptyTableaux = 0
        // maxMove = 0 + 0 + 1 = 1.
        // Moving sequence of 4 cards (s8 -> s7 -> s6 -> s5) should be disallowed!
        expect(game.previewDrop(s8, t1)).toBe(false);

        // But moving just s5 (single card, length 1) to s6Target on t2 is allowed because maxMove = 1
        expect(game.previewDrop(s5, t2)).toBe(true);
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
