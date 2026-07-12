import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from './Game';
import { GameOptions } from './GameOptions';
import { Rank } from '~CardLib/Model/Rank';
import { Suit } from '~CardLib/Model/Suit';
import { Colour } from '~CardLib/Model/Colour';

function consume(generator: Generator<any, any, any>) {
    let result = generator.next();
    while (!result.done) {
        result = generator.next();
    }
}

describe('Westcliff Game Model', () => {
    let game: Game;

    beforeEach(() => {
        const options = new GameOptions(new URLSearchParams());
        options.autoReveal = false;
        options.autoPlayStock = false;
        options.autoMoveToFoundation = 0;
        game = new Game(options);
    });

    it('should initialize correctly with 10 tableaux, 4 foundations, stock, and waste', () => {
        expect(game.stock).toBeDefined();
        expect(game.waste).toBeDefined();
        expect(game.foundations.length).toBe(4);
        expect(game.tableaux.length).toBe(10);
        expect(game.cards.length).toBe(52);
    });

    it('should correctly deal 3 cards to each tableau, with bottom 2 face down and top 1 face up', () => {
        consume(game.restart(12345));

        expect(game.stock.length).toBe(22);
        expect(game.waste.length).toBe(0);

        for (const tab of game.tableaux) {
            expect(tab.length).toBe(3);
            expect(tab.at(0).faceUp).toBe(false);
            expect(tab.at(1).faceUp).toBe(false);
            expect(tab.at(2).faceUp).toBe(true);
        }
    });

    it('should produce deterministic deal with a fixed seed', () => {
        const game1 = new Game(new GameOptions(new URLSearchParams()));
        consume(game1.restart(12345));

        const game2 = new Game(new GameOptions(new URLSearchParams()));
        consume(game2.restart(12345));

        expect(game1.stock.length).toBe(game2.stock.length);
        for (let i = 0; i < game1.stock.length; i++) {
            expect(game1.stock.at(i).suit).toBe(game2.stock.at(i).suit);
            expect(game1.stock.at(i).rank).toBe(game2.stock.at(i).rank);
        }
    });

    it('should allow valid and reject invalid moves on tableaux', () => {
        // Clear all initial cards from tableaux to keep things clean
        consume(game.restart(1));
        game.cards = [];
        for (const pile of game.piles) {
            while (pile.length > 0) {
                pile.slice().forEach(c => {
                    // remove card by empty push or just truncate cards in pile
                    // but the cleanest is resetting pile.cards_ to []
                    (pile as any).cards_ = [];
                });
            }
        }

        const pile1 = game.tableaux[0];
        const pile2 = game.tableaux[1];

        // Create Red 8 on pile1, Black 7 on pile2
        const cardRed8 = pile1.createCard(Suit.Hearts, Colour.Red, Rank.Eight);
        cardRed8.faceUp = true;
        game.cards.push(cardRed8);

        const cardBlack7 = pile2.createCard(Suit.Spades, Colour.Black, Rank.Seven);
        cardBlack7.faceUp = true;
        game.cards.push(cardBlack7);

        // Can we drop Black 7 on Red 8?
        let canDrop = (game as any).previewDrop_(cardBlack7, pile1);
        expect(canDrop).toBe(true);

        // Try drop
        consume(game.dropCard(cardBlack7, pile1));
        expect(pile1.length).toBe(2);
        expect(pile1.peek()).toBe(cardBlack7);
        expect(pile2.length).toBe(0);

        // Now create a Black 8 on pile2
        const cardBlack8 = pile2.createCard(Suit.Clubs, Colour.Black, Rank.Eight);
        cardBlack8.faceUp = true;
        game.cards.push(cardBlack8);

        // Can we drop Black 7 on Black 8? (Invalid due to same color)
        canDrop = (game as any).previewDrop_(cardBlack7, pile2);
        expect(canDrop).toBe(false);
    });

    it('should allow empty tableaux to be filled with any card', () => {
        // Clear all initial cards
        consume(game.restart(1));
        game.cards = [];
        for (const pile of game.piles) {
            (pile as any).cards_ = [];
        }

        const pile1 = game.tableaux[0]; // empty
        const pile2 = game.tableaux[1];

        const cardRed3 = pile2.createCard(Suit.Diamonds, Colour.Red, Rank.Three);
        cardRed3.faceUp = true;
        game.cards.push(cardRed3);

        const canDrop = (game as any).previewDrop_(cardRed3, pile1);
        expect(canDrop).toBe(true); // Yes, any card can fill an empty tableau
    });

    it('should allow foundations to build up by suit, Ace to King', () => {
        // Clear all initial cards
        consume(game.restart(1));
        game.cards = [];
        for (const pile of game.piles) {
            (pile as any).cards_ = [];
        }

        const f1 = game.foundations[0];
        const tab1 = game.tableaux[0];

        const aceHearts = tab1.createCard(Suit.Hearts, Colour.Red, Rank.Ace);
        aceHearts.faceUp = true;
        game.cards.push(aceHearts);

        // Ace should go to empty foundation
        let canDrop = (game as any).previewDrop_(aceHearts, f1);
        expect(canDrop).toBe(true);

        consume(game.dropCard(aceHearts, f1));
        expect(f1.length).toBe(1);
        expect(f1.peek()).toBe(aceHearts);

        const twoHearts = tab1.createCard(Suit.Hearts, Colour.Red, Rank.Two);
        twoHearts.faceUp = true;
        game.cards.push(twoHearts);

        // Hearts 2 should go to Hearts Ace
        canDrop = (game as any).previewDrop_(twoHearts, f1);
        expect(canDrop).toBe(true);

        consume(game.dropCard(twoHearts, f1));
        expect(f1.length).toBe(2);
        expect(f1.peek()).toBe(twoHearts);

        const twoSpades = tab1.createCard(Suit.Spades, Colour.Black, Rank.Two);
        twoSpades.faceUp = true;
        game.cards.push(twoSpades);

        // Spades 2 should NOT go to Hearts Ace/Two
        canDrop = (game as any).previewDrop_(twoSpades, f1);
        expect(canDrop).toBe(false);
    });

    it('should have a won state flag that returns true when all cards are in foundations', () => {
        // Clear all initial cards
        consume(game.restart(1));
        game.cards = [];
        for (const pile of game.piles) {
            (pile as any).cards_ = [];
        }

        expect(game.won).toBe(false);

        // Put 52 cards directly into foundations
        for (let i = 0; i < 42; ++i) {
            const card = game.foundations[0].createCard(Suit.Hearts, Colour.Red, Rank.Ace);
            game.cards.push(card);
        }
        for (let i = 0; i < 10; ++i) {
            const card = game.foundations[1].createCard(Suit.Spades, Colour.Black, Rank.Ace);
            game.cards.push(card);
        }

        // Trigger won calculation check, since won checks depend on sum of foundations being 52
        expect((game as any).doGetWon_()).toBe(true);
    });
});
