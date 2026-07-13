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
    public readonly tableaux: Pile[] = [];
    public readonly foundations: Pile[] = [];
    public readonly reserves: Pile[] = [];

    constructor(options: GameOptions) {
        super();

        this.options = options;

        // 9 tableaux fanned face up
        for (let i = 0; i < 9; ++i) {
            const pile = new Pile(this);
            this.tableaux.push(pile);
            this.piles.push(pile);
        }

        // 4 foundations
        for (let i = 0; i < 4; ++i) {
            const pile = new Pile(this);
            this.foundations.push(pile);
            this.piles.push(pile);
        }

        // 7 reserves (Belgian Reserve), individually fanned/positioned
        for (let i = 0; i < 7; ++i) {
            const pile = new Pile(this);
            this.reserves.push(pile);
            this.piles.push(pile);
        }

        // Initialize cards
        this.cards = DeckUtils.createStandard52Deck(this.tableaux[0] ?? Debug.error());
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
        const tempPile = new Pile(this);

        // Gather all cards back to the temporary pile
        for (const pile of this.piles) {
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

        // Deal 45 cards to 9 tableaux fanned face up (1, 2, ... 9 cards)
        for (let i = 0; i < 9; ++i) {
            const tableau = this.tableaux[i] ?? Debug.error();
            for (let j = 0; j <= i; ++j) {
                const card = tempPile.peek();
                if (card) {
                    tableau.push(card);
                    card.faceUp = true;
                    yield DelayHint.Quick;
                }
            }
        }

        // Deal remaining 7 cards to 7 reserves, 1 card each
        for (let i = 0; i < 7; ++i) {
            const reserve = this.reserves[i] ?? Debug.error();
            const card = tempPile.peek();
            if (card) {
                reserve.push(card);
                card.faceUp = true;
                yield DelayHint.Quick;
            }
        }

        yield DelayHint.OneByOne;

        yield* this.doAutoMoves_();
    }

    protected *cardPrimary_(card: Card) {}

    protected *cardSecondary_(card: Card) {
        // Double-click -> auto-move to foundations
        for (const foundation of this.foundations) {
            if (this.isFoundationDrop_(card, foundation)) {
                foundation.push(card);
                yield DelayHint.OneByOne;
                yield* this.doAutoMoves_();
                return;
            }
        }
    }

    protected *pilePrimary_(pile: Pile) {}

    protected *pileSecondary_(pile: Pile) {}

    protected canDrag_(card: Card): { canDrag: boolean; extraCards: Card[] } {
        if (!card.faceUp) return { canDrag: false, extraCards: [] };

        // Only single card may move at a time - no sequences
        if (card.pile.peek() !== card) {
            return { canDrag: false, extraCards: [] };
        }

        if (this.tableaux.indexOf(card.pile) >= 0 ||
            this.reserves.indexOf(card.pile) >= 0 ||
            this.foundations.indexOf(card.pile) >= 0) {
            return { canDrag: true, extraCards: [] };
        }

        return { canDrag: false, extraCards: [] };
    }

    protected previewDrop_(card: Card, pile: Pile): boolean {
        return this.isTableauDrop_(card, pile) || this.isFoundationDrop_(card, pile);
    }

    protected *dropCard_(card: Card, pile: Pile) {
        if (this.previewDrop_(card, pile)) {
            const movingCards = [card, ...this.canDrag_(card).extraCards];
            for (const movingCard of movingCards) {
                pile.push(movingCard);
            }
            yield DelayHint.OneByOne;
            yield* this.doAutoMoves_();
        }
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
        if (!dragResult.canDrag || dragResult.extraCards.length > 0) return false;

        const topCard = pile.peek();
        if (topCard) {
            return topCard.colour !== card.colour && this.getCardValue_(topCard) === this.getCardValue_(card) + 1;
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

                const sources = [...this.tableaux, ...this.reserves];
                for (const pile of sources) {
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
