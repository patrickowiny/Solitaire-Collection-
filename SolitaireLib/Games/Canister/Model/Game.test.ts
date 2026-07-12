import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "./Game";
import { GameOptions } from "./GameOptions";
import { Suit } from "~CardLib/Model/Suit";
import { Colour } from "~CardLib/Model/Colour";
import { Rank } from "~CardLib/Model/Rank";
import { Pile } from "~CardLib/Model/Pile";

describe("Canister Game Model", () => {
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
        const params = new URLSearchParams("");
        game = new Game(new GameOptions(params));
    });

    it("should initialize correctly", () => {
        expect(game.tableaux.length).toBe(8);
        expect(game.foundations.length).toBe(4);
        expect(game.cards.length).toBe(52);
    });

    it("should deal cards correctly on restart (leftmost 4 columns have 7, others have 6)", () => {
        const restartGen = game.restart(12345);
        let result = restartGen.next();
        while (!result.done) {
            result = restartGen.next();
        }

        const expectedCounts = [7, 7, 7, 7, 6, 6, 6, 6];
        for (let i = 0; i < 8; ++i) {
            expect(game.tableaux[i]!.length).toBe(expectedCounts[i]);
        }

        for (const card of game.cards) {
            expect(card.faceUp).toBe(true);
        }

        for (const fd of game.foundations) {
            expect(fd.length).toBe(0);
        }
    });

    it("should produce deterministic deal with a fixed seed", () => {
        const game1 = new Game(new GameOptions(new URLSearchParams()));
        const restart1 = game1.restart(12345);
        while (!restart1.next().done);

        const game2 = new Game(new GameOptions(new URLSearchParams()));
        const restart2 = game2.restart(12345);
        while (!restart2.next().done);

        expect(game1.tableaux.length).toBe(game2.tableaux.length);
        for (let i = 0; i < game1.tableaux.length; i++) {
            const p1 = game1.tableaux[i]!;
            const p2 = game2.tableaux[i]!;
            expect(p1.length).toBe(p2.length);
            for (let j = 0; j < p1.length; j++) {
                expect(p1.at(j)!.suit).toBe(p2.at(j)!.suit);
                expect(p1.at(j)!.rank).toBe(p2.at(j)!.rank);
            }
        }
    });

    it("should allow dragging single card or same-suit descending sequences", () => {
        clearAllPiles(game);

        const t0 = game.tableaux[0]!;

        // Hearts 8
        const h8 = t0.createCard(Suit.Hearts, Colour.Red, Rank.Eight);
        h8.faceUp = true;
        game.cards.push(h8);

        // Hearts 7
        const h7 = t0.createCard(Suit.Hearts, Colour.Red, Rank.Seven);
        h7.faceUp = true;
        game.cards.push(h7);

        // Hearts 6
        const h6 = t0.createCard(Suit.Hearts, Colour.Red, Rank.Six);
        h6.faceUp = true;
        game.cards.push(h6);

        // Dragging h7 should be allowed since h7-h6 is same-suit descending sequence
        const dragH7 = game.canDrag(h7);
        expect(dragH7.canDrag).toBe(true);
        expect(dragH7.extraCards.length).toBe(1);
        expect(dragH7.extraCards[0]).toBe(h6);

        // Dragging h8 should be allowed since h8-h7-h6 is same-suit descending sequence
        const dragH8 = game.canDrag(h8);
        expect(dragH8.canDrag).toBe(true);
        expect(dragH8.extraCards.length).toBe(2);
        expect(dragH8.extraCards[0]).toBe(h7);
        expect(dragH8.extraCards[1]).toBe(h6);
    });

    it("should NOT allow dragging mixed-suit sequences as a group", () => {
        clearAllPiles(game);

        const t0 = game.tableaux[0]!;

        // Hearts 8
        const h8 = t0.createCard(Suit.Hearts, Colour.Red, Rank.Eight);
        h8.faceUp = true;
        game.cards.push(h8);

        // Spades 7 (mixed suit!)
        const s7 = t0.createCard(Suit.Spades, Colour.Black, Rank.Seven);
        s7.faceUp = true;
        game.cards.push(s7);

        // Dragging h8 should fail because the sequence underneath it has a mixed suit (Hearts 8 then Spades 7)
        const dragH8 = game.canDrag(h8);
        expect(dragH8.canDrag).toBe(false);

        // Dragging s7 should succeed since it's the top card
        const dragS7 = game.canDrag(s7);
        expect(dragS7.canDrag).toBe(true);
        expect(dragS7.extraCards.length).toBe(0);
    });

    it("should allow dropping cards on one rank higher, regardless of suit", () => {
        clearAllPiles(game);

        const t0 = game.tableaux[0]!;
        const t1 = game.tableaux[1]!;

        // Spades 8 on t0
        const s8 = t0.createCard(Suit.Spades, Colour.Black, Rank.Eight);
        s8.faceUp = true;
        game.cards.push(s8);

        // Hearts 7 on t1
        const h7 = t1.createCard(Suit.Hearts, Colour.Red, Rank.Seven);
        h7.faceUp = true;
        game.cards.push(h7);

        // Can drop Hearts 7 on Spades 8 (rank 8 is rank 7 + 1, suit is different)
        expect(game.previewDrop(h7, t0)).toBe(true);

        // Let's perform the drop
        const dropGen = game.dropCard(h7, t0);
        while (!dropGen.next().done);

        expect(t0.length).toBe(2);
        expect(t0.peek()).toBe(h7);
        expect(t1.length).toBe(0);
    });

    it("should allow dropping any card/sequence on an empty tableau column", () => {
        clearAllPiles(game);

        const t0 = game.tableaux[0]!;
        const t1 = game.tableaux[1]!;

        // Hearts 5 on t0
        const h5 = t0.createCard(Suit.Hearts, Colour.Red, Rank.Five);
        h5.faceUp = true;
        game.cards.push(h5);

        // Can drop on empty t1
        expect(game.previewDrop(h5, t1)).toBe(true);
    });

    it("should automatically move single eligible cards to foundations based on threshold", () => {
        clearAllPiles(game);

        // Set autoMoveToFoundation to 2 (default)
        game.options.autoMoveToFoundation = 2;

        const t0 = game.tableaux[0]!;
        const fd0 = game.foundations[0]!;

        // Put Spades Ace on t0
        const ace = t0.createCard(Suit.Spades, Colour.Black, Rank.Ace);
        ace.faceUp = true;
        game.cards.push(ace);

        expect(t0.length).toBe(1);
        expect(fd0.length).toBe(0);

        // Trigger restart dealing or any action that runs doAutoMoves_
        // Or we can invoke dropCard/restart. Since clearAllPiles keeps game in a state, we can simulate an action
        // or just call a move that triggers doAutoMoves_
        // Let's just drop Ace onto the foundation manually to start, or trigger auto moves by dropping a card
        const t1 = game.tableaux[1]!;
        const s2 = t1.createCard(Suit.Spades, Colour.Black, Rank.Two);
        s2.faceUp = true;
        game.cards.push(s2);

        // Drop Spades Ace to foundation 0
        const dropGen = game.dropCard(ace, fd0);
        while (!dropGen.next().done);

        // Since Spades Ace is now in fd0, and Spades 2 is on t1.
        // The value of Spades 2 is 2, which is <= foundationMin (0 since empty foundation exists?
        // Wait, other foundations are empty, so foundationMin = 0.
        // Spades 2 value is 2. 2 <= 0 + 2 (autoMoveToFoundation threshold).
        // So Spades 2 should automatically move to fd0!
        expect(fd0.length).toBe(2);
        expect(fd0.peek()).toBe(s2);
        expect(t1.length).toBe(0);
    });

    it("should report win condition when all 52 cards are sorted into foundations", () => {
        clearAllPiles(game);

        expect(game.won).toBe(false);

        // Populate the foundations
        const suits = [Suit.Spades, Suit.Hearts, Suit.Diamonds, Suit.Clubs];
        const colours = [Colour.Black, Colour.Red, Colour.Red, Colour.Black];
        const ranks = [
            Rank.Ace, Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six,
            Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King
        ];

        for (let f = 0; f < 4; ++f) {
            const fd = game.foundations[f]!;
            const suit = suits[f]!;
            const colour = colours[f]!;
            for (const r of ranks) {
                const card = fd.createCard(suit, colour, r);
                card.faceUp = true;
                game.cards.push(card);
            }
        }

        expect((game as any).doGetWon_()).toBe(true);
        expect(game.wonCards.length).toBe(52);
    });
});
