import prand from "pure-rand";
import * as Debug from "~CardLib/Debug";
import { Card } from "~CardLib/Model/Card";
import * as DeckUtils from "~CardLib/Model/DeckUtils";
import { DelayHint } from "~CardLib/Model/DelayHint";
import { GameBase } from "~CardLib/Model/GameBase";
import { Pile } from "~CardLib/Model/Pile";
import { Rank } from "~CardLib/Model/Rank";
import { GameOptions } from "./GameOptions";
import { IGame } from "./IGame";

export class Game extends GameBase implements IGame {
    public readonly options: GameOptions;
    public readonly foundations: Pile[] = [];
    public readonly tableaux: Pile[] = [];

    constructor(options: GameOptions) {
        super();

        this.options = options;

        // Register 8 tableaux piles
        for (let i = 0; i < 8; ++i) {
            const pile = new Pile(this);
            this.tableaux.push(pile);
            this.piles.push(pile);
        }

        // Register 4 foundation piles
        for (let i = 0; i < 4; ++i) {
            const pile = new Pile(this);
            this.foundations.push(pile);
            this.piles.push(pile);
        }

        // Initialize cards
        this.cards = DeckUtils.createStandard52Deck(this.foundations[0] ?? Debug.error());
    }

    protected doGetWon_() {
        let sum = 0;
        for (const pile of this.foundations) {
            sum += pile.length;
        }
        return sum === 52;
    }

    public get wonCards() {
        const wonCards: Card[] = [];
        for (const pile of this.foundations) {
            for (const card of pile) {
                wonCards.push(card);
            }
        }
        wonCards.sort((a, b) => {
            if (a.pileIndex > b.pileIndex) return 1;
            if (a.pileIndex < b.pileIndex) return -1;
            if (a.rank > b.rank) return 1;
            if (a.rank < b.rank) return -1;
            return 0;
        });
        return wonCards;
    }

    protected *restart_(rng: prand.RandomGenerator) {
        const tempPile = this.foundations[0] ?? Debug.error();

        // Gather all cards back to the temporary pile
        for (const pile of this.piles) {
            if (pile === tempPile) continue;
            for (let i = pile.length; i-- > 0; ) {
                const card = pile.at(i);
                card.faceUp = true;
                tempPile.push(card);
            }
        }

        for (const card of tempPile) {
            card.faceUp = true;
        }

        tempPile.sort();
        tempPile.shuffle(rng);

        yield DelayHint.Settle;

        // Deal 8 tableau piles, all face up:
        // Leftmost 4 piles get 7 cards each, remaining 4 piles get 6 cards each.
        // Deal cards row-by-row
        for (let row = 0; row < 7; ++row) {
            for (let col = 0; col < 8; ++col) {
                if (row === 6 && col >= 4) {
                    continue;
                }
                const destTableau = this.tableaux[col] ?? Debug.error();
                const card = tempPile.peek();
                if (card) {
                    destTableau.push(card);
                    card.faceUp = true;
                    yield DelayHint.Quick;
                }
            }
        }

        yield DelayHint.OneByOne;

        yield* this.doAutoMoves_();
    }

    protected *cardPrimary_(card: Card) {}

    protected *cardSecondary_(card: Card) {
        // Double-click -> auto-move to foundations
        if (this.canDrag_(card).canDrag && this.canDrag_(card).extraCards.length === 0) {
            for (const foundation of this.foundations) {
                if (this.isFoundationDrop_(card, foundation)) {
                    foundation.push(card);
                    yield DelayHint.OneByOne;
                    yield* this.doAutoMoves_();
                    return;
                }
            }
        }
    }

    protected *pilePrimary_(pile: Pile) {}

    protected *pileSecondary_(pile: Pile) {}

    protected canDrag_(card: Card): { canDrag: boolean; extraCards: Card[] } {
        if (!card.faceUp) return { canDrag: false, extraCards: [] };

        if (this.foundations.indexOf(card.pile) >= 0) {
            if (card.pile.peek() === card) {
                return { canDrag: true, extraCards: [] };
            }
        } else if (this.tableaux.indexOf(card.pile) >= 0) {
            if (this.isSameSuitSequence_(card)) {
                return { canDrag: true, extraCards: card.pile.slice(card.pileIndex + 1) };
            }
        }

        return { canDrag: false, extraCards: [] };
    }

    protected previewDrop_(card: Card, pile: Pile): boolean {
        return this.isTableauDrop_(card, pile) || this.isFoundationDrop_(card, pile);
    }

    protected *dropCard_(card: Card, pile: Pile) {
        if (this.isTableauDrop_(card, pile)) {
            const movingCards = [card, ...this.canDrag_(card).extraCards];
            for (const movingCard of movingCards) {
                pile.push(movingCard);
            }
            yield DelayHint.OneByOne;
            yield* this.doAutoMoves_();
        } else if (this.isFoundationDrop_(card, pile)) {
            pile.push(card);
            yield DelayHint.OneByOne;
            yield* this.doAutoMoves_();
        }
    }

    private isSameSuitSequence_(card: Card): boolean {
        if (!card.faceUp) return false;
        const pile = card.pile;
        if (this.tableaux.indexOf(pile) < 0) return false;
        for (let i = card.pileIndex; i < pile.length - 1; ++i) {
            const card0 = pile.at(i);
            const card1 = pile.at(i + 1);
            if (!card0.faceUp || !card1.faceUp) return false;
            if (card0.suit !== card1.suit) return false;
            if (this.getCardValue_(card0) !== this.getCardValue_(card1) + 1) return false;
        }
        return true;
    }

    private isFoundationDrop_(card: Card, pile: Pile): boolean {
        if (card.pile === pile) return false;
        if (this.foundations.indexOf(pile) < 0) return false;

        const dragResult = this.canDrag_(card);
        if (!dragResult.canDrag || dragResult.extraCards.length > 0) return false;

        const topCard = pile.peek();
        if (topCard) {
            return this.getCardValue_(topCard) + 1 === this.getCardValue_(card) && topCard.suit === card.suit;
        } else {
            return card.rank === Rank.Ace;
        }
    }

    private isTableauDrop_(card: Card, pile: Pile): boolean {
        if (card.pile === pile) return false;
        if (this.tableaux.indexOf(pile) < 0) return false;

        const dragResult = this.canDrag_(card);
        if (!dragResult.canDrag) return false;

        const topCard = pile.peek();
        if (topCard) {
            return this.getCardValue_(topCard) === this.getCardValue_(card) + 1;
        } else {
            return true;
        }
    }

    private getCardValue_(card: Card) {
        switch (card.rank) {
            case Rank.Ace:
                return 1;
            case Rank.Two:
                return 2;
            case Rank.Three:
                return 3;
            case Rank.Four:
                return 4;
            case Rank.Five:
                return 5;
            case Rank.Six:
                return 6;
            case Rank.Seven:
                return 7;
            case Rank.Eight:
                return 8;
            case Rank.Nine:
                return 9;
            case Rank.Ten:
                return 10;
            case Rank.Jack:
                return 11;
            case Rank.Queen:
                return 12;
            case Rank.King:
                return 13;
            default:
                Debug.error();
        }
    }

    private *doAutoMoves_() {
        mainLoop: while (true) {
            if (this.options.autoMoveToFoundation > 0) {
                let foundationMin = 999;
                for (const pile of this.foundations) {
                    const card = pile.peek();
                    if (card) {
                        foundationMin = Math.min(foundationMin, this.getCardValue_(card));
                    } else {
                        foundationMin = Math.min(foundationMin, 0);
                    }
                }

                for (const pile of this.tableaux) {
                    const card = pile.peek();
                    if (card && this.getCardValue_(card) <= foundationMin + this.options.autoMoveToFoundation) {
                        for (const foundation of this.foundations) {
                            if (this.isFoundationDrop_(card, foundation)) {
                                foundation.push(card);
                                yield DelayHint.OneByOne;
                                continue mainLoop;
                            }
                        }
                    }
                }
            }

            break;
        }
    }
}
