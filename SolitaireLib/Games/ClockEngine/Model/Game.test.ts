import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from './Game';
import { GameOptions } from './GameOptions';
import { Rank } from "~CardLib/Model/Rank";

describe('ClockEngine Game Model', () => {
    describe('Grandfather Mode', () => {
        let game: Game;

        beforeEach(() => {
            const params = new URLSearchParams();
            params.set("engineMode", "grandfather");
            game = new Game(new GameOptions(params));
        });

        it('should initialize correctly', () => {
            expect(game.foundations.length).toBe(12);
            expect(game.tableaux.length).toBe(8);
        });

        it('should have a winnable state flag', () => {
            expect(game.won).toBe(false);
        });
    });

    describe('Simplicity Mode', () => {
        let game: Game;

        beforeEach(() => {
            const params = new URLSearchParams();
            params.set("engineMode", "simplicity");
            game = new Game(new GameOptions(params));
        });

        it('should initialize correctly', () => {
            expect(game.foundations.length).toBe(4);
            expect(game.tableaux.length).toBe(6);
            expect(game.stock).toBeDefined();
            expect(game.waste).toBeDefined();
        });
    });
});
