import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from './Game';
import { GameOptions } from './GameOptions';

describe('Klondike Game Model', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game(new GameOptions(new URLSearchParams()));
    });

    it('should initialize correctly', () => {
        expect(game.stock).toBeDefined();
        expect(game.waste).toBeDefined();
        expect(game.foundations.length).toBe(4);
        expect(game.tableaux.length).toBe(7);
    });

    it('should produce deterministic deal with a fixed seed', () => {
        const game1 = new Game(new GameOptions(new URLSearchParams()));
        game1.restart(12345);
        
        const game2 = new Game(new GameOptions(new URLSearchParams()));
        game2.restart(12345);

        // Check if stock cards are in the same order
        expect(game1.stock.length).toBe(game2.stock.length);
        for(let i = 0; i < game1.stock.length; i++) {
            expect(game1.stock.at(i).suit).toBe(game2.stock.at(i).suit);
            expect(game1.stock.at(i).rank).toBe(game2.stock.at(i).rank);
        }
    });

    it('should reject illegal moves', () => {
        game.restart(1);
        const topStock = game.stock.peek();
        if (topStock) {
            // we use previewDrop_ to check illegal move logic
            const isValid = (game as any).previewDrop_(topStock, game.foundations[0]);
            expect(isValid).toBe(false);
        }
    });
    
    it('should have a winnable state flag', () => {
        expect(game.won).toBe(false);
    });
});
