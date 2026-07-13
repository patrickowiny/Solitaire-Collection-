import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from './Game';
import { GameOptions } from './GameOptions';
import { Rank } from '~CardLib/Model/Rank';
import { Suit } from '~CardLib/Model/Suit';
import { Colour } from '~CardLib/Model/Colour';

describe('Easthaven Game Model', () => {
    let game: Game;

    const runGenerator = (gen: Generator<any, any, any>) => {
        while (!gen.next().done) {}
    };

    beforeEach(() => {
        const options = new GameOptions(new URLSearchParams());
        options.autoReveal = false;
        options.autoMoveToFoundation = 0;
        game = new Game(options);
    });

    it('should initialize correctly', () => {
        expect(game.stock).toBeDefined();
        expect(game.foundations.length).toBe(4);
        expect(game.tableaux.length).toBe(7);
        expect(game.cards.length).toBe(52);
    });

    it('should produce deterministic deal with a fixed seed', () => {
        const game1 = new Game(new GameOptions(new URLSearchParams()));
        game1.options.autoReveal = false;
        game1.options.autoMoveToFoundation = 0;
        runGenerator(game1.restart(12345));

        const game2 = new Game(new GameOptions(new URLSearchParams()));
        game2.options.autoReveal = false;
        game2.options.autoMoveToFoundation = 0;
        runGenerator(game2.restart(12345));

        expect(game1.stock.length).toBe(game2.stock.length);
        for (let i = 0; i < game1.stock.length; i++) {
            const c1 = game1.stock.at(i);
            const c2 = game2.stock.at(i);
            expect(c1.suit).toBe(c2.suit);
            expect(c1.rank).toBe(c2.rank);
        }

        for (let t = 0; t < 7; t++) {
            expect(game1.tableaux[t].length).toBe(3);
            expect(game2.tableaux[t].length).toBe(3);
            for (let i = 0; i < 3; i++) {
                const c1 = game1.tableaux[t].at(i);
                const c2 = game2.tableaux[t].at(i);
                expect(c1.suit).toBe(c2.suit);
                expect(c1.rank).toBe(c2.rank);
                expect(c1.faceUp).toBe(c2.faceUp);
            }
        }
    });

    it('should respect drag/drop rules', () => {
        runGenerator(game.restart(42));

        // Find a top card of a tableau
        const t0 = game.tableaux[0];
        const topCard0 = t0.peek();
        expect(topCard0).toBeDefined();
        expect(topCard0!.faceUp).toBe(true);

        // A face up top card should be dragger-friendly
        const dragInfo = (game as any).canDrag_(topCard0!);
        expect(dragInfo.canDrag).toBe(true);

        // Try to drop it on empty foundation
        const isValidFoundationDrop = (game as any).previewDrop_(topCard0!, game.foundations[0]);
        if (topCard0!.rank === Rank.Ace) {
            expect(isValidFoundationDrop).toBe(true);
        } else {
            expect(isValidFoundationDrop).toBe(false);
        }
    });

    it('should block dealing when an empty tableau exists and a King is available', () => {
        runGenerator(game.restart(100));

        // Let's manually clear tableau 0 by moving all its cards to tableau 1
        const t0 = game.tableaux[0];
        const t1 = game.tableaux[1];

        // Move cards of t0 to t1 to make t0 empty
        while (t0.length > 0) {
            t1.push(t0.at(0));
        }
        expect(t0.length).toBe(0);

        // Change any other face up Kings in tableaux to Queens, so that we have NO available Kings initially
        for (const tableau of game.tableaux) {
            for (const card of tableau) {
                if (card.rank === Rank.King) {
                    (card as any).rank = Rank.Queen;
                }
            }
        }

        // Since there are no face up Kings in any other tableaux, dealing should be allowed
        expect((game as any).canDealFromStock_()).toBe(true);

        // Let's manually place a King on tableau 2 at index 1 (meaning it's on top of another card, pileIndex > 0)
        const t2 = game.tableaux[2];
        const kingCard = game.cards.find(c => c.rank === Rank.King) || game.cards[0];
        (kingCard as any).rank = Rank.King; // Ensure it's a King

        // Ensure kingCard is face up and at pileIndex > 0
        kingCard!.faceUp = true;
        t2.push(kingCard!);

        // Since we have an empty tableau t0 AND an available King at t2 (pileIndex > 0), dealing should be blocked
        expect((game as any).canDealFromStock_()).toBe(false);

        // If we move the King to the empty tableau t0
        runGenerator((game as any).dropCard_(kingCard!, t0));
        expect(t0.length).toBe(1);
        expect(t0.peek()).toBe(kingCard);

        // Now t0 is no longer empty, so dealing should be allowed again
        expect((game as any).canDealFromStock_()).toBe(true);
    });

    it('should allow dealing from stock correctly', () => {
        runGenerator(game.restart(777));
        const initialStockLen = game.stock.length; // 31
        expect(initialStockLen).toBe(31);

        // Deal from stock
        runGenerator((game as any).pilePrimary_(game.stock));
        expect(game.stock.length).toBe(24);
        for (let i = 0; i < 7; i++) {
            expect(game.tableaux[i].length).toBe(4);
            expect(game.tableaux[i].peek()!.faceUp).toBe(true);
        }
    });

    it('should handle final deal with fewer than 7 cards', () => {
        runGenerator(game.restart(777));

        // Perform 4 deals
        runGenerator((game as any).pilePrimary_(game.stock)); // 31 -> 24
        runGenerator((game as any).pilePrimary_(game.stock)); // 24 -> 17
        runGenerator((game as any).pilePrimary_(game.stock)); // 17 -> 10
        runGenerator((game as any).pilePrimary_(game.stock)); // 10 -> 3
        expect(game.stock.length).toBe(3);

        // 5th deal should only deal 3 cards
        runGenerator((game as any).pilePrimary_(game.stock)); // 3 -> 0
        expect(game.stock.length).toBe(0);

        // First 3 tableaux should have been dealt a card
        expect(game.tableaux[0].length).toBe(8);
        expect(game.tableaux[1].length).toBe(8);
        expect(game.tableaux[2].length).toBe(8);
        // The rest should remain at 7 cards
        expect(game.tableaux[3].length).toBe(7);
        expect(game.tableaux[4].length).toBe(7);
        expect(game.tableaux[5].length).toBe(7);
        expect(game.tableaux[6].length).toBe(7);
    });

    it('should evaluate win condition correctly', () => {
        expect(game.won).toBe(false);

        // Safely move all cards to the foundations to mock win state
        let fIdx = 0;
        for (const card of game.cards) {
            game.foundations[fIdx].push(card);
            fIdx = (fIdx + 1) % 4;
        }

        // Trigger win evaluation as per guidelines
        (game as any).checkWon_();
        expect(game.won).toBe(true);
    });
});
