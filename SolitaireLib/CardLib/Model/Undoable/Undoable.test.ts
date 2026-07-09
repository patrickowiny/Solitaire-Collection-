import { describe, it, expect, vi } from 'vitest';
import { CardFlipOperation } from './CardFlipOperation';
import { Card } from '../Card';

describe('Undoable Operations', () => {
    describe('CardFlipOperation', () => {
        it('should correctly undo and redo', () => {
            const card = { doSetFaceUp: vi.fn() } as unknown as Card;
            const op = new CardFlipOperation(card, false, true);
            
            op.undo();
            expect(card.doSetFaceUp).toHaveBeenCalledWith(false);
            
            op.redo();
            expect(card.doSetFaceUp).toHaveBeenCalledWith(true);
        });
    });
});
