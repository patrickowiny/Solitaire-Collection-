import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "./Game";
import { GameOptions } from "./GameOptions";
import { Card } from "~CardLib/Model/Card";
import { Suit } from "~CardLib/Model/Suit";
import { Rank } from "~CardLib/Model/Rank";
import { Pile } from "~CardLib/Model/Pile";
import { Colour } from "~CardLib/Model/Colour";

describe("AmericanToad Game Model", () => {
    let game: Game;

    const clearPile = (pile: Pile) => {
        const tempPile = new Pile(game);
        while (pile.length > 0) {
            tempPile.push(pile.peek()!);
        }
    };

    beforeEach(() => {
        const params = new URLSearchParams();
        // Construct the game and options first, then disable behaviors directly on options properties:
        game = new Game(new GameOptions(params));
        game.options.autoReveal = false;
        game.options.autoPlayStock = false;
        game.options.autoMoveToFoundation = 0;
    });

    it("should initialize with correct pile structure", () => {
        expect(game.stock).toBeDefined();
        expect(game.waste).toBeDefined();
        expect(game.reserve).toBeDefined();
        expect(game.foundations.length).toBe(8);
        expect(game.tableaux.length).toBe(8);
        expect(game.cards.length).toBe(104);
    });

    it("should deal correct number of cards face up", () => {
        // Run restart with generator consumption
        Array.from(game.restart(12345));

        expect(game.reserve.length).toBe(20);
        for (const card of game.reserve) {
            expect(card.faceUp).toBe(true);
        }

        expect(game.foundations[0].length).toBe(1);
        expect(game.foundations[0].peek()?.faceUp).toBe(true);
        for (let i = 1; i < 8; ++i) {
            expect(game.foundations[i].length).toBe(0);
        }

        for (let i = 0; i < 8; ++i) {
            expect(game.tableaux[i].length).toBe(1);
            expect(game.tableaux[i].peek()?.faceUp).toBe(true);
        }

        expect(game.stock.length).toBe(75);
    });

    it("should determine starting foundation rank correctly", () => {
        Array.from(game.restart(999));

        const baseCard = game.foundations[0].peek() as Card;
        expect(baseCard).toBeDefined();
        const startRank = (game as any).getStartingFoundationRank_();
        expect(startRank).toBe(baseCard.rank);
    });

    it("should validate foundation building rules including wrapping", () => {
        Array.from(game.restart(111));

        const startRank = (game as any).getStartingFoundationRank_();

        // Clear foundation 1 and waste
        clearPile(game.foundations[1]);
        clearPile(game.waste);

        // Put card with startRank in waste
        const card1 = game.waste.createCard(Suit.Spades, Colour.Black, startRank);
        card1.faceUp = true;

        // Starting rank card should be accepted on empty foundation:
        expect((game as any).isFoundationDrop_(card1, game.foundations[1])).toBe(true);

        // Non-starting rank should be rejected on empty foundation:
        const wrongRank = startRank === Rank.Ace ? Rank.Two : Rank.Ace;
        const cardWrong = game.waste.createCard(Suit.Spades, Colour.Black, wrongRank);
        cardWrong.faceUp = true;
        expect((game as any).isFoundationDrop_(cardWrong, game.foundations[1])).toBe(false);

        // Build up on top card: Mock foundation 1 having a King of Spades
        clearPile(game.foundations[1]);
        const kingOfSpades = game.foundations[1].createCard(Suit.Spades, Colour.Black, Rank.King);
        kingOfSpades.faceUp = true;

        // Ace of Spades in waste should be accepted on King of Spades (wrapping build up)
        clearPile(game.waste);
        const aceOfSpades = game.waste.createCard(Suit.Spades, Colour.Black, Rank.Ace);
        aceOfSpades.faceUp = true;
        expect((game as any).isFoundationDrop_(aceOfSpades, game.foundations[1])).toBe(true);

        // Jack of Spades in waste should be rejected on King of Spades
        clearPile(game.waste);
        const jackOfSpades = game.waste.createCard(Suit.Spades, Colour.Black, Rank.Jack);
        jackOfSpades.faceUp = true;
        expect((game as any).isFoundationDrop_(jackOfSpades, game.foundations[1])).toBe(false);
    });

    it("should validate tableau building rules including wrapping", () => {
        Array.from(game.restart(222));

        // Clear tableaux[0] and waste
        clearPile(game.tableaux[0]);
        clearPile(game.waste);

        // Mock an Ace of Spades on tableau 0
        const aceOfSpadesOnTableau = game.tableaux[0].createCard(Suit.Spades, Colour.Black, Rank.Ace);
        aceOfSpadesOnTableau.faceUp = true;

        // King of Spades should build down on Ace of Spades (wrapping build down: Ace followed by King)
        const kingOfSpades = game.waste.createCard(Suit.Spades, Colour.Black, Rank.King);
        kingOfSpades.faceUp = true;
        expect((game as any).isTableauxDrop_(kingOfSpades, game.tableaux[0])).toBe(true);

        // Clear tableaux[0] and waste again
        clearPile(game.tableaux[0]);
        clearPile(game.waste);

        // Mock a King of Spades on tableau 0
        const kingOfSpadesOnTableau = game.tableaux[0].createCard(Suit.Spades, Colour.Black, Rank.King);
        kingOfSpadesOnTableau.faceUp = true;

        // Queen of Spades should build down on King of Spades
        const queenOfSpades = game.waste.createCard(Suit.Spades, Colour.Black, Rank.Queen);
        queenOfSpades.faceUp = true;
        expect((game as any).isTableauxDrop_(queenOfSpades, game.tableaux[0])).toBe(true);

        // Jack of Spades should NOT build down on King of Spades
        clearPile(game.waste);
        const jackOfSpades = game.waste.createCard(Suit.Spades, Colour.Black, Rank.Jack);
        jackOfSpades.faceUp = true;
        expect((game as any).isTableauxDrop_(jackOfSpades, game.tableaux[0])).toBe(false);

        // Different suit card (Queen of Hearts) should NOT build down on King of Spades
        clearPile(game.waste);
        const queenOfHearts = game.waste.createCard(Suit.Hearts, Colour.Red, Rank.Queen);
        queenOfHearts.faceUp = true;
        expect((game as any).isTableauxDrop_(queenOfHearts, game.tableaux[0])).toBe(false);
    });

    it("should allow moving single cards or same-suit sequences between tableaux", () => {
        Array.from(game.restart(333));

        // Clear tableaux[0]
        clearPile(game.tableaux[0]);

        // Build a valid same-suit sequence: King of Hearts -> Queen of Hearts
        const kingOfHearts = game.tableaux[0].createCard(Suit.Hearts, Colour.Red, Rank.King);
        kingOfHearts.faceUp = true;
        game.cards.push(kingOfHearts);

        const queenOfHearts = game.tableaux[0].createCard(Suit.Hearts, Colour.Red, Rank.Queen);
        queenOfHearts.faceUp = true;
        game.cards.push(queenOfHearts);

        // Dragging top card (queenOfHearts) should be allowed
        expect(game.canDrag(queenOfHearts).canDrag).toBe(true);

        // Dragging entire sequence starting from kingOfHearts (index 0) should be allowed
        expect(game.canDrag(kingOfHearts).canDrag).toBe(true);

        // Add a non-matching card at the end
        const jackOfSpades = game.tableaux[0].createCard(Suit.Spades, Colour.Black, Rank.Jack);
        jackOfSpades.faceUp = true;
        game.cards.push(jackOfSpades);

        // Dragging entire sequence from kingOfHearts is now NOT allowed (sequence is broken in suit/build)
        expect(game.canDrag(kingOfHearts).canDrag).toBe(false);
    });

    it("should automatically fill empty tableau from reserve", () => {
        Array.from(game.restart(444));

        const reserveInitialLength = game.reserve.length; // should be 20
        expect(reserveInitialLength).toBe(20);

        // Clear tableau 0 to trigger auto fill
        clearPile(game.tableaux[0]);
        expect(game.tableaux[0].length).toBe(0);

        // Run auto moves generator
        Array.from((game as any).doAutoMoves_());

        // Reserve top card should have moved to tableaux[0]
        expect(game.tableaux[0].length).toBe(1);
        expect(game.reserve.length).toBe(reserveInitialLength - 1);
    });

    it("should detect won state correctly", () => {
        expect(game.won).toBe(false);

        // Clear foundations
        for (const pile of game.foundations) {
            clearPile(pile);
        }

        // Fill foundations standard mock win
        for (let i = 0; i < game.cards.length; i++) {
            game.foundations[i % 8].push(game.cards[i]);
        }

        (game as any).checkWon_();
        expect(game.won).toBe(true);
    });
});
