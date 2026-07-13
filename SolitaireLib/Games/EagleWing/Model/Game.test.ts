import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "./Game";
import { GameOptions } from "./GameOptions";
import { Rank } from "~CardLib/Model/Rank";
import { Suit } from "~CardLib/Model/Suit";
import { Card } from "~CardLib/Model/Card";

function runGen(gen: Generator<any, any, any>) {
    while (!gen.next().done) {}
}

describe("EagleWing Solitaire Game Model", () => {
    let game: Game;

    beforeEach(() => {
        const options = new GameOptions(new URLSearchParams());
        options.autoMoveToFoundation = 0; // disable auto moves
        options.autoPlayStock = false;    // disable auto play stock so stock/waste state matches expectation exactly
        game = new Game(options);
    });

    it("should initialize correctly with empty piles", () => {
        expect(game.stock).toBeDefined();
        expect(game.waste).toBeDefined();
        expect(game.trunk).toBeDefined();
        expect(game.foundations.length).toBe(4);
        expect(game.tableaux.length).toBe(8);
        expect(game.won).toBe(false);
    });

    it("should deal correctly on restart", () => {
        runGen(game.restart(12345));

        expect(game.trunk.length).toBe(13);
        // All trunk cards should be face down initially
        for (let i = 0; i < 13; ++i) {
            expect(game.trunk.at(i).faceUp).toBe(false);
        }

        expect(game.tableaux.length).toBe(8);
        for (const wing of game.tableaux) {
            expect(wing.length).toBe(1);
            expect(wing.at(0).faceUp).toBe(true);
        }

        expect(game.foundations[0].length).toBe(1);
        expect(game.foundations[0].at(0).faceUp).toBe(true);
        expect(game.foundations[1].length).toBe(0);
        expect(game.foundations[2].length).toBe(0);
        expect(game.foundations[3].length).toBe(0);

        expect(game.stock.length).toBe(30);
    });

    it("should produce a deterministic deal with a fixed seed", () => {
        const options1 = new GameOptions(new URLSearchParams());
        options1.autoMoveToFoundation = 0;
        options1.autoPlayStock = false;
        const game1 = new Game(options1);
        runGen(game1.restart(9999));

        const options2 = new GameOptions(new URLSearchParams());
        options2.autoMoveToFoundation = 0;
        options2.autoPlayStock = false;
        const game2 = new Game(options2);
        runGen(game2.restart(9999));

        expect(game1.stock.length).toBe(game2.stock.length);
        for (let i = 0; i < game1.stock.length; ++i) {
            expect(game1.stock.at(i).suit).toBe(game2.stock.at(i).suit);
            expect(game1.stock.at(i).rank).toBe(game2.stock.at(i).rank);
        }
    });

    it("should automatically refill empty wing spaces from the top of the trunk", () => {
        runGen(game.restart(12345));

        // Get the top card of the trunk
        const topTrunkCard = game.trunk.peek()!;
        expect(topTrunkCard).toBeDefined();
        expect(topTrunkCard.faceUp).toBe(false);

        // Make the first tableau wing empty by moving its card to waste or foundation if valid,
        // or we can manually empty it to simulate the gap.
        const wing0 = game.tableaux[0];
        const wing0Card = wing0.peek()!;

        // Let's manually move wing0Card somewhere else to empty the wing
        game.waste.push(wing0Card);
        expect(wing0.length).toBe(0);

        // Triggering any game operation should trigger auto moves (like refilling)
        runGen(game.cardPrimary(game.stock.peek()!));

        // wing0 should now have been automatically refilled with topTrunkCard and turned face-up
        expect(wing0.length).toBe(1);
        expect(wing0.peek()).toBe(topTrunkCard);
        expect(topTrunkCard.faceUp).toBe(true);
        expect(game.trunk.length).toBe(12);
    });

    it("should turn trunk's last card face up and make it playable", () => {
        runGen(game.restart(12345));

        // To reduce trunk to 1 card, let's empty tableaux several times
        while (game.trunk.length > 1) {
            const wing = game.tableaux[0];
            const card = wing.peek();
            if (card) {
                game.waste.push(card);
            }
            // Trigger auto refill
            runGen(game.cardPrimary(game.stock.peek()!));
        }

        expect(game.trunk.length).toBe(1);
        const lastCard = game.trunk.peek()!;
        expect(lastCard.faceUp).toBe(true);

        // The last card is directly playable (draggable)
        const { canDrag } = game.canDrag(lastCard);
        expect(canDrag).toBe(true);
    });

    it("should allow drawing cards from stock to waste and allow 2 redeals", () => {
        runGen(game.restart(12345));

        expect(game.stock.length).toBe(30);
        expect(game.waste.length).toBe(0);

        // Draw all cards
        for (let i = 0; i < 30; ++i) {
            const topStock = game.stock.peek()!;
            runGen(game.cardPrimary(topStock));
        }

        expect(game.stock.length).toBe(0);
        expect(game.waste.length).toBe(30);

        // First redeal
        runGen(game.pilePrimary(game.stock));
        expect(game.stock.length).toBe(30);
        expect(game.waste.length).toBe(0);

        // Draw all cards again
        for (let i = 0; i < 30; ++i) {
            const topStock = game.stock.peek()!;
            runGen(game.cardPrimary(topStock));
        }

        expect(game.stock.length).toBe(0);
        expect(game.waste.length).toBe(30);

        // Second redeal
        runGen(game.pilePrimary(game.stock));
        expect(game.stock.length).toBe(30);

        // Draw all cards again
        for (let i = 0; i < 30; ++i) {
            const topStock = game.stock.peek()!;
            runGen(game.cardPrimary(topStock));
        }

        // Third redeal should NOT be allowed
        runGen(game.pilePrimary(game.stock));
        expect(game.stock.length).toBe(0);
    });

    it("should respect building up on foundation with wrapping (King to Ace)", () => {
        runGen(game.restart(12345));

        // Setup custom cards to test foundation wrapping:
        const f0 = game.foundations[0];
        // Empty foundation
        while (f0.length > 0) {
            game.waste.push(f0.peek()!);
        }

        // Clear waste so we have clean test state
        while (game.waste.length > 0) {
            game.stock.push(game.waste.peek()!);
        }

        const cardKing = game.cards.find((c: Card) => c.rank === Rank.King && c.suit === Suit.Hearts)!;
        const cardAce = game.cards.find((c: Card) => c.rank === Rank.Ace && c.suit === Suit.Hearts)!;
        const cardTwo = game.cards.find((c: Card) => c.rank === Rank.Two && c.suit === Suit.Hearts)!;

        cardKing.faceUp = true;
        cardAce.faceUp = true;
        cardTwo.faceUp = true;

        (game as any).baseRank_ = Rank.King;

        // Play King onto empty foundation
        game.waste.push(cardKing);
        expect(game.previewDrop(cardKing, f0)).toBe(true);
        runGen(game.dropCard(cardKing, f0));
        expect(f0.peek()).toBe(cardKing);

        // Ace should build on King
        game.waste.push(cardAce);
        expect(game.previewDrop(cardAce, f0)).toBe(true);
        runGen(game.dropCard(cardAce, f0));
        expect(f0.peek()).toBe(cardAce);

        // Two should build on Ace
        game.waste.push(cardTwo);
        expect(game.previewDrop(cardTwo, f0)).toBe(true);
        runGen(game.dropCard(cardTwo, f0));
        expect(f0.peek()).toBe(cardTwo);
    });

    it("should respect building down on tableau wings with wrapping (Ace to King), max 3 cards", () => {
        runGen(game.restart(12345));

        const t0 = game.tableaux[0];
        while (t0.length > 0) {
            game.waste.push(t0.peek()!);
        }

        // Clear waste so we have clean test state
        while (game.waste.length > 0) {
            game.stock.push(game.waste.peek()!);
        }

        const cardAce = game.cards.find((c: Card) => c.rank === Rank.Ace && c.suit === Suit.Diamonds)!;
        const cardKing = game.cards.find((c: Card) => c.rank === Rank.King && c.suit === Suit.Diamonds)!;
        const cardQueen = game.cards.find((c: Card) => c.rank === Rank.Queen && c.suit === Suit.Diamonds)!;
        const cardJack = game.cards.find((c: Card) => c.rank === Rank.Jack && c.suit === Suit.Diamonds)!;

        cardAce.faceUp = true;
        cardKing.faceUp = true;
        cardQueen.faceUp = true;
        cardJack.faceUp = true;

        // Force empty trunk so we don't automatically refill when t0 is empty
        while (game.trunk.length > 0) {
            game.waste.push(game.trunk.peek()!);
        }
        // Clear waste again
        while (game.waste.length > 0) {
            game.stock.push(game.waste.peek()!);
        }

        // Put Ace on empty t0 (allowed since trunk is empty, can fill gap from stock/waste/tableaux)
        game.waste.push(cardAce);
        expect(game.previewDrop(cardAce, t0)).toBe(true);
        runGen(game.dropCard(cardAce, t0));
        expect(t0.peek()).toBe(cardAce);

        // King should build down on Ace (wrapping)
        game.waste.push(cardKing);
        expect(game.previewDrop(cardKing, t0)).toBe(true);
        runGen(game.dropCard(cardKing, t0));
        expect(t0.peek()).toBe(cardKing);

        // Queen should build down on King
        game.waste.push(cardQueen);
        expect(game.previewDrop(cardQueen, t0)).toBe(true);
        runGen(game.dropCard(cardQueen, t0));
        expect(t0.peek()).toBe(cardQueen);

        // Now t0 has 3 cards (Ace, King, Queen). Jack is next, but t0 already has max 3 cards.
        game.waste.push(cardJack);
        expect(game.previewDrop(cardJack, t0)).toBe(false);
    });
});
