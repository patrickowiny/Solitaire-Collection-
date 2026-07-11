import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "./Game";
import { GameOptions } from "./GameOptions";
import { Rank } from "~CardLib/Model/Rank";
import { Suit } from "~CardLib/Model/Suit";
import { Colour } from "~CardLib/Model/Colour";
import { Pile } from "~CardLib/Model/Pile";

describe("SimpleSimon Game Model", () => {
    let game: Game;

    const consume = (gen: Generator<any, any, any>) => {
        let res = gen.next();
        while (!res.done) {
            res = gen.next();
        }
    };

    const clearPile = (pile: Pile, dest: Pile) => {
        while (pile.length > 0) {
            dest.push(pile.peek()!);
        }
    };

    beforeEach(() => {
        game = new Game(new GameOptions(new URLSearchParams()));
    });

    it("should initialize with correct piles and counts", () => {
        expect(game.tableaux.length).toBe(10);
        expect(game.foundations.length).toBe(4);
        expect(game.cards.length).toBe(52);
    });

    it("should deal the correct number of cards face up to each column", () => {
        consume(game.restart(12345));

        const expectedCounts = [8, 8, 8, 7, 6, 5, 4, 3, 2, 1];
        for (let i = 0; i < 10; ++i) {
            expect(game.tableaux[i].length).toBe(expectedCounts[i]);
            // Every card should be face up
            for (const card of game.tableaux[i]) {
                expect(card.faceUp).toBe(true);
            }
        }
    });

    it("should validate same-suit descending sequence checks correctly", () => {
        consume(game.restart(12345));
        const tableau = game.tableaux[0];
        const dummyDest = game.foundations[0];

        // Clear the tableau and add custom sequence
        clearPile(tableau, dummyDest);

        const cardK = game.cards[0];
        cardK.suit = Suit.Spades;
        cardK.rank = Rank.King;
        cardK.colour = Colour.Black;

        const cardQ = game.cards[1];
        cardQ.suit = Suit.Spades;
        cardQ.rank = Rank.Queen;
        cardQ.colour = Colour.Black;

        const cardJ = game.cards[2];
        cardJ.suit = Suit.Hearts; // Mixed suit!
        cardJ.rank = Rank.Jack;
        cardJ.colour = Colour.Red;

        tableau.push(cardK);
        tableau.push(cardQ);
        tableau.push(cardJ);

        // Same suit check for cardK should be false since J is Hearts
        expect((game as any).isSameSuitSequence_(cardK)).toBe(false);

        // But cardQ and cardJ sequence is same suit? No, Q is Spades and J is Hearts
        expect((game as any).isSameSuitSequence_(cardQ)).toBe(false);

        // cardJ is single card at bottom, should be true
        expect((game as any).isSameSuitSequence_(cardJ)).toBe(true);

        // Update cardJ to Spades
        cardJ.suit = Suit.Spades;
        cardJ.colour = Colour.Black;

        // Now entire sequence of K-Q-J Spades is valid same-suit sequence
        expect((game as any).isSameSuitSequence_(cardK)).toBe(true);
        expect((game as any).isSameSuitSequence_(cardQ)).toBe(true);
        expect((game as any).isSameSuitSequence_(cardJ)).toBe(true);
    });

    it("should allow legal drops and reject illegal drops", () => {
        consume(game.restart(12345));

        // Custom setup
        const tab0 = game.tableaux[0];
        const tab1 = game.tableaux[1];
        const dummyDest = game.foundations[0];

        clearPile(tab0, dummyDest);
        clearPile(tab1, dummyDest);

        const card7Spades = game.cards[0];
        card7Spades.suit = Suit.Spades;
        card7Spades.rank = Rank.Seven;

        const card6Hearts = game.cards[1];
        card6Hearts.suit = Suit.Hearts;
        card6Hearts.rank = Rank.Six;

        tab0.push(card7Spades);
        tab1.push(card6Hearts);

        // Can we move 6 of Hearts onto 7 of Spades? (One rank lower onto one rank higher, regardless of suit)
        expect(game.previewDrop(card6Hearts, tab0)).toBe(true);

        const card8Diamonds = game.cards[2];
        card8Diamonds.suit = Suit.Diamonds;
        card8Diamonds.rank = Rank.Eight;

        // Cannot move 8 onto 7 (must be lower onto higher)
        clearPile(tab1, dummyDest);
        tab1.push(card8Diamonds);
        expect(game.previewDrop(card8Diamonds, tab0)).toBe(false);

        // Cannot move onto same card / same pile
        expect(game.previewDrop(card7Spades, tab0)).toBe(false);
    });

    it("should auto-move completed 13-card same-suit sequences to foundation", () => {
        consume(game.restart(12345));

        const tab0 = game.tableaux[0];
        const dummyDest = game.foundations[0];
        clearPile(tab0, dummyDest);
        clearPile(game.foundations[0], game.tableaux[1]); // Ensure foundation is completely empty

        // Build a perfect King to Ace sequence of Spades in tab0
        const spadeCards = game.cards.filter(c => c.suit === Suit.Spades);
        // Sort spadeCards descending from King (13) to Ace (1)
        const rankOrder = [
            Rank.King, Rank.Queen, Rank.Jack, Rank.Ten, Rank.Nine, Rank.Eight,
            Rank.Seven, Rank.Six, Rank.Five, Rank.Four, Rank.Three, Rank.Two, Rank.Ace
        ];

        for (const rank of rankOrder) {
            const card = spadeCards.find(c => c.rank === rank);
            if (card) {
                // Ensure card is in dummy pile/dest so we can push it cleanly
                dummyDest.push(card);
                tab0.push(card);
            }
        }

        expect(tab0.length).toBe(13);

        // Trigger autoMoves directly!
        const gen = (game as any).doAutoMoves_();
        let result = gen.next();
        while (!result.done) {
            result = gen.next();
        }

        // The sequence should now be in foundation!
        expect(tab0.length).toBe(0);
        expect(game.foundations[0].length).toBe(13);
    });

    it("should correctly identify won state when all cards are in foundations", () => {
        expect(game.won).toBe(false);

        // Move all cards to foundations
        let fIdx = 0;
        for (let i = 0; i < 52; ++i) {
            if (game.foundations[fIdx].length === 13) {
                fIdx++;
            }
            game.foundations[fIdx].push(game.cards[i]);
        }

        expect((game as any).doGetWon_()).toBe(true);
    });
});
