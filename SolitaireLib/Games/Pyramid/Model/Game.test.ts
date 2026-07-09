import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from './Game';
import { GameOptions } from './GameOptions';

describe('Pyramid Game Model', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game(new GameOptions(new URLSearchParams()));
    });

    it('should initialize correctly', () => {
        expect(game.stock).toBeDefined();
        expect(game.waste).toBeDefined();
        expect(game.foundation).toBeDefined();
        expect(game.pyramid.length).toBe(7);
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

    it('should have a winnable state flag', () => {
        expect(game.won).toBe(false);
    });
});
