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
    public readonly stock = new Pile(this);
    public readonly waste = new Pile(this);
    public readonly reserve = new Pile(this);
    public readonly foundations: Pile[] = [];
    public readonly tableaux: Pile[] = [];

    private readonly dragSingleSources_: Pile[] = [];
    private readonly autoMoveSources_: Pile[] = [];
    private restocks_ = 0;

    constructor(options: GameOptions) {
        super();

        this.options = options;

        // Register piles:
        this.piles.push(this.stock);
        this.piles.push(this.waste);
        this.piles.push(this.reserve);

        this.dragSingleSources_.push(this.waste);
        this.dragSingleSources_.push(this.reserve);

        this.autoMoveSources_.push(this.waste);
        this.autoMoveSources_.push(this.reserve);

        for (let i = 0; i < 8; ++i) {
            const pile = new Pile(this);
            this.foundations.push(pile);
            this.piles.push(pile);
        }

        for (let i = 0; i < 8; ++i) {
            const pile = new Pile(this);
            this.tableaux.push(pile);
            this.piles.push(pile);
            this.dragSingleSources_.push(pile);
            this.autoMoveSources_.push(pile);
        }

        // Two 52-card decks combined (104 cards total)
        this.cards = [
            ...DeckUtils.createStandard52Deck(this.stock),
            ...DeckUtils.createStandard52Deck(this.stock),
        ];
    }

    protected doGetWon_() {
        let sum = 0;
        for (const pile of this.foundations) {
            sum += pile.length;
        }
        return sum === 104;
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
        this.restocks_ = 0;

        // Reset all cards to stock face-down:
        for (const card of this.stock) {
            card.faceUp = false;
        }

        for (let pileIndex = this.piles.length; pileIndex-- > 0; ) {
            const pile = this.piles[pileIndex] ?? Debug.error();
            if (pile === this.stock) continue;
            for (let cardIndex = pile.length; cardIndex-- > 0; ) {
                const card = pile.at(cardIndex);
                card.faceUp = false;
                this.stock.push(card);
            }
        }

        // Sort and shuffle:
        this.stock.sort();
        this.stock.shuffle(rng);

        yield DelayHint.Settle;

        // Deal 20 cards face up to reserve pile
        for (let i = 0; i < 20; ++i) {
            const card = this.stock.peek();
            if (card) {
                this.reserve.push(card);
                card.faceUp = true;
                yield DelayHint.Quick;
            }
        }

        // Deal one card to the first foundation pile
        const baseCard = this.stock.peek();
        if (baseCard) {
            this.foundations[0].push(baseCard);
            baseCard.faceUp = true;
            yield DelayHint.Quick;
        }

        // Deal 8 cards to tableaux (1 card each, face up)
        for (let i = 0; i < 8; ++i) {
            const card = this.stock.peek();
            if (card) {
                this.tableaux[i].push(card);
                card.faceUp = true;
                yield DelayHint.Quick;
            }
        }

        yield DelayHint.OneByOne;

        yield* this.doAutoMoves_();
    }

    protected *cardPrimary_(card: Card) {
        // If clicking on stock and can draw, draw one card:
        if (this.stock.peek() === card && this.canDrawFromStock_()) {
            yield* this.doDrawFromStock_();
            yield* this.doAutoMoves_();
            return;
        }
    }

    protected *cardSecondary_(card: Card) {
        // If double clicking a card, try to auto-move to foundations:
        if (this.autoMoveSources_.indexOf(card.pile) >= 0) {
            for (const foundation of this.foundations) {
                if (this.isFoundationDrop_(card, foundation)) {
                    yield* this.doFoundationDrop_(card, foundation);
                    yield* this.doAutoMoves_();
                    return;
                }
            }
        }
    }

    protected *pilePrimary_(pile: Pile) {
        // If clicking the stock and it has been depleted, redeal:
        if (
            pile === this.stock &&
            this.stock.length === 0 &&
            this.waste.length > 0 &&
            this.restocks_ < this.options.restocksAllowed
        ) {
            this.restocks_++;
            for (let i = this.waste.length; i-- > 0; ) {
                const card = this.waste.at(i);
                card.faceUp = false;
            }
            this.waste.maxFan = 0;
            yield DelayHint.OneByOne;
            for (let i = this.waste.length; i-- > 0; ) {
                const card = this.waste.at(i);
                this.stock.push(card);
            }
            yield DelayHint.OneByOne;
            yield* this.doAutoMoves_();
            return;
        }
    }

    protected *pileSecondary_(pile: Pile) {}

    protected canDrag_(card: Card): { canDrag: boolean; extraCards: Card[] } {
        if (card.pile === this.reserve || card.pile === this.waste) {
            if (card.pile.peek() === card && card.faceUp) {
                return { canDrag: true, extraCards: [] };
            }
        } else if (this.tableaux.indexOf(card.pile) >= 0) {
            if (card.pile.peek() === card && card.faceUp) {
                return { canDrag: true, extraCards: [] };
            } else if (card.pileIndex === 0 && this.isSameSuitSequence_(card)) {
                return { canDrag: true, extraCards: card.pile.slice(card.pileIndex + 1) };
            }
        }
        return { canDrag: false, extraCards: [] };
    }

    protected previewDrop_(card: Card, pile: Pile): boolean {
        return this.isTableauxDrop_(card, pile) || this.isFoundationDrop_(card, pile);
    }

    protected *dropCard_(card: Card, pile: Pile) {
        if (this.isTableauxDrop_(card, pile)) {
            yield* this.doTableauxDrop_(card, pile);
            yield* this.doAutoMoves_();
        } else if (this.isFoundationDrop_(card, pile)) {
            yield* this.doFoundationDrop_(card, pile);
            yield* this.doAutoMoves_();
        }
    }

    private canDrawFromStock_() {
        return this.stock.length > 0;
    }

    private *doDrawFromStock_() {
        this.waste.maxFan = 0;
        for (let i = 0; i < this.options.stockDraws; ++i) {
            const card = this.stock.peek();
            if (card) {
                this.waste.push(card);
                this.waste.maxFan++;
                yield DelayHint.Quick;
                card.faceUp = true;
                if (i < this.options.stockDraws - 1) {
                    yield DelayHint.Quick;
                }
            }
        }
        yield DelayHint.OneByOne;
    }

    private getStartingFoundationRank_(): Rank | undefined {
        return this.foundations[0]?.at(0)?.rank;
    }

    private isTableauxDrop_(card: Card, pile: Pile) {
        if (card.pile === pile) return false;
        if (this.tableaux.indexOf(pile) < 0) return false;

        const topCard = pile.peek();
        if (topCard) {
            // Tableaux build down in suit, wrapping so Ace may follow King (i.e. Ace -> King)
            const topVal = this.getCardValue_(topCard);
            const cardVal = this.getCardValue_(card);
            const expectedVal = topVal === 1 ? 13 : topVal - 1;
            if (cardVal === expectedVal && topCard.suit === card.suit) {
                return true;
            }
        } else {
            // Empty spaces can only be filled by any card once reserve is exhausted
            if (this.reserve.length === 0) {
                return true;
            }
        }
        return false;
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
            const val0 = this.getCardValue_(card0);
            const val1 = this.getCardValue_(card1);
            const expectedVal = val0 === 1 ? 13 : val0 - 1;
            if (val1 !== expectedVal) return false;
        }
        return true;
    }

    private *doTableauxDrop_(card: Card, pile: Pile) {
        const movingCards = card.pile.slice(card.pileIndex);
        for (const movingCard of movingCards) {
            pile.push(movingCard);
        }
        yield DelayHint.OneByOne;
    }

    private isFoundationDrop_(card: Card, pile: Pile) {
        if (card.pile === pile) return false;
        if (this.foundations.indexOf(pile) < 0) return false;

        const topCard = pile.peek();
        if (topCard) {
            // Foundations build up in suit, wrapping King to Ace
            const topVal = this.getCardValue_(topCard);
            const cardVal = this.getCardValue_(card);
            if (cardVal === (topVal % 13) + 1 && topCard.suit === card.suit) {
                return true;
            }
        } else {
            // Empty foundation needs the base starting rank
            const startRank = this.getStartingFoundationRank_();
            if (startRank !== undefined && card.rank === startRank) {
                return true;
            }
        }
        return false;
    }

    private *doFoundationDrop_(card: Card, pile: Pile) {
        pile.push(card);
        yield DelayHint.OneByOne;
    }

    private getRankValue_(rank: Rank) {
        switch (rank) {
            case Rank.Ace: return 1;
            case Rank.Two: return 2;
            case Rank.Three: return 3;
            case Rank.Four: return 4;
            case Rank.Five: return 5;
            case Rank.Six: return 6;
            case Rank.Seven: return 7;
            case Rank.Eight: return 8;
            case Rank.Nine: return 9;
            case Rank.Ten: return 10;
            case Rank.Jack: return 11;
            case Rank.Queen: return 12;
            case Rank.King: return 13;
            default: return 0;
        }
    }

    private getCardValue_(card: Card) {
        return this.getRankValue_(card.rank);
    }

    private getRelativeFoundationValue_(card: Card) {
        const startRank = this.getStartingFoundationRank_();
        if (startRank === undefined) return 0;
        const baseVal = this.getRankValue_(startRank);
        const cardVal = this.getCardValue_(card);
        return (cardVal - baseVal + 13) % 13;
    }

    private *doAutoMoves_() {
        mainLoop: while (true) {
            if (this.options.autoReveal) {
                // Ensure top card of reserve is face up (though dealt face up, good for safety)
                if (this.reserve.length > 0) {
                    const card = this.reserve.peek();
                    if (card && !card.faceUp) {
                        card.faceUp = true;
                        yield DelayHint.OneByOne;
                        continue mainLoop;
                    }
                }
            }

            // Fill empty tableaux automatically from reserve first:
            if (this.reserve.length > 0) {
                for (const tableau of this.tableaux) {
                    if (tableau.length === 0) {
                        const card = this.reserve.peek();
                        if (card) {
                            tableau.push(card);
                            card.faceUp = true;
                            yield DelayHint.OneByOne;
                            continue mainLoop;
                        }
                    }
                }
            }

            // Auto-move to foundation:
            if (this.options.autoMoveToFoundation > 0) {
                let foundationMin = 999;
                for (const pile of this.foundations) {
                    const card = pile.peek();
                    if (card) {
                        foundationMin = Math.min(foundationMin, this.getRelativeFoundationValue_(card));
                    } else {
                        foundationMin = Math.min(foundationMin, -1);
                    }
                }

                for (const pile of this.autoMoveSources_) {
                    const card = pile.peek();
                    if (card && this.getRelativeFoundationValue_(card) <= foundationMin + this.options.autoMoveToFoundation) {
                        for (const foundation of this.foundations) {
                            if (this.isFoundationDrop_(card, foundation)) {
                                yield* this.doFoundationDrop_(card, foundation);
                                continue mainLoop;
                            }
                        }
                    }
                }
            }

            if (this.options.autoPlayStock) {
                if (this.waste.length === 0 && this.canDrawFromStock_()) {
                    yield* this.doDrawFromStock_();
                    continue mainLoop;
                }
            }

            break;
        }
    }
}
