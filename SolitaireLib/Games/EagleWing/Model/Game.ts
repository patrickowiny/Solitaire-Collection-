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
    public readonly trunk = new Pile(this);
    public readonly foundations: Pile[] = [];
    public readonly tableaux: Pile[] = [];

    private readonly dragSingleSources_: Pile[] = [];
    private readonly autoMoveSources_: Pile[] = [];
    private baseRank_: Rank | undefined = undefined;
    private restocks_ = 0;

    constructor(options: GameOptions) {
        super();

        this.options = options;

        this.piles.push(this.stock);
        this.piles.push(this.waste);
        this.piles.push(this.trunk);

        for (let i = 0; i < 4; ++i) {
            const pile = new Pile(this);
            this.foundations.push(pile);
            this.piles.push(pile);
        }

        for (let i = 0; i < 8; ++i) {
            const pile = new Pile(this);
            this.tableaux.push(pile);
            this.piles.push(pile);
        }

        // Auto move sources: waste, trunk, tableaux
        this.autoMoveSources_.push(this.waste);
        this.autoMoveSources_.push(this.trunk);
        for (const t of this.tableaux) {
            this.autoMoveSources_.push(t);
        }

        this.cards = DeckUtils.createStandard52Deck(this.stock);
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
        this.baseRank_ = undefined;
        this.restocks_ = 0;

        // Reset all cards to stock face-down
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

        this.stock.sort();
        this.stock.shuffle(rng);

        yield DelayHint.Settle;

        // 1. Deal 13 cards to trunk face down.
        for (let i = 0; i < 13; ++i) {
            const card = this.stock.peek();
            if (card) {
                this.trunk.push(card);
                card.faceUp = false;
                yield DelayHint.Quick;
            }
        }

        // 2. Deal 8 cards face up to 8 tableau columns.
        for (let i = 0; i < 8; ++i) {
            const card = this.stock.peek();
            if (card) {
                this.tableaux[i].push(card);
                card.faceUp = true;
                yield DelayHint.Quick;
            }
        }

        // 3. Deal the 22nd card face up to start the first foundation.
        const baseCard = this.stock.peek();
        if (baseCard) {
            this.foundations[0].push(baseCard);
            baseCard.faceUp = true;
            this.baseRank_ = baseCard.rank;
            yield DelayHint.Quick;
        }

        yield DelayHint.OneByOne;

        yield* this.doAutoMoves_();
    }

    protected *cardPrimary_(card: Card) {
        if (this.stock.peek() === card && this.canDrawFromStock_()) {
            yield* this.doDrawFromStock_();
            yield* this.doAutoMoves_();
            return;
        }
    }

    protected *cardSecondary_(card: Card) {
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
        if (card.pile === this.waste && this.waste.peek() === card && card.faceUp) {
            return { canDrag: true, extraCards: [] };
        }
        if (card.pile === this.trunk && this.trunk.peek() === card && card.faceUp) {
            return { canDrag: true, extraCards: [] };
        }
        if (this.foundations.indexOf(card.pile) >= 0 && card.pile.peek() === card && card.faceUp) {
            return { canDrag: true, extraCards: [] };
        }
        if (this.tableaux.indexOf(card.pile) >= 0 && card.faceUp) {
            const index = card.pileIndex;
            for (let i = index; i < card.pile.length - 1; ++i) {
                const card0 = card.pile.at(i);
                const card1 = card.pile.at(i + 1);
                if (!card0.faceUp || !card1.faceUp) return { canDrag: false, extraCards: [] };
                if (card0.suit !== card1.suit) return { canDrag: false, extraCards: [] };
                const val0 = this.getCardValue_(card0.rank);
                const val1 = this.getCardValue_(card1.rank);
                const expectedVal = val0 === 1 ? 13 : val0 - 1;
                if (val1 !== expectedVal) return { canDrag: false, extraCards: [] };
            }
            return { canDrag: true, extraCards: card.pile.slice(index + 1) };
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
        const card = this.stock.peek();
        if (card) {
            this.waste.push(card);
            card.faceUp = true;
            yield DelayHint.Quick;
        }
        yield DelayHint.OneByOne;
    }

    private isTableauxDrop_(card: Card, pile: Pile) {
        if (!card.faceUp) return false;
        if (card.pile === pile) return false;
        if (this.tableaux.indexOf(pile) < 0) return false;

        const topCard = pile.peek();
        const movingCards = card.pile.slice(card.pileIndex);

        if (pile.length + movingCards.length > 3) {
            return false;
        }

        if (topCard) {
            if (topCard.suit !== card.suit) return false;
            const topVal = this.getCardValue_(topCard.rank);
            const cardVal = this.getCardValue_(card.rank);
            const expectedVal = topVal === 1 ? 13 : topVal - 1;
            return cardVal === expectedVal;
        } else {
            if (this.trunk.length === 0) {
                if (movingCards.length <= 3 && (card.pile === this.waste || card.pile === this.stock || this.tableaux.indexOf(card.pile) >= 0)) {
                    return true;
                }
            }
        }

        return false;
    }

    private *doTableauxDrop_(card: Card, pile: Pile) {
        const movingCards = card.pile.slice(card.pileIndex);
        for (const movingCard of movingCards) {
            pile.push(movingCard);
        }
        yield DelayHint.OneByOne;
    }

    private isFoundationDrop_(card: Card, pile: Pile) {
        if (!card.faceUp) return false;
        if (card.pile === pile) return false;
        if (this.foundations.indexOf(pile) < 0) return false;
        if (card.pile.peek() !== card) return false;

        const topCard = pile.peek();
        if (topCard) {
            if (topCard.suit !== card.suit) return false;
            const topVal = this.getCardValue_(topCard.rank);
            const cardVal = this.getCardValue_(card.rank);
            return cardVal === (topVal % 13) + 1;
        } else {
            return this.baseRank_ !== undefined && card.rank === this.baseRank_;
        }
    }

    private *doFoundationDrop_(card: Card, pile: Pile) {
        pile.push(card);
        yield DelayHint.OneByOne;
    }

    private getCardValue_(rank: Rank) {
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

    private getRelativeFoundationValue_(card: Card) {
        if (this.baseRank_ === undefined) return 0;
        const baseVal = this.getCardValue_(this.baseRank_);
        const cardVal = this.getCardValue_(card.rank);
        return (cardVal - baseVal + 13) % 13;
    }

    private *doAutoMoves_() {
        mainLoop: while (true) {
            if (this.trunk.length > 0) {
                for (const wing of this.tableaux) {
                    if (wing.length === 0) {
                        const card = this.trunk.peek();
                        if (card) {
                            wing.push(card);
                            card.faceUp = true;
                            yield DelayHint.OneByOne;
                            continue mainLoop;
                        }
                    }
                }
            }

            if (this.trunk.length === 1) {
                const card = this.trunk.peek();
                if (card && !card.faceUp) {
                    card.faceUp = true;
                    yield DelayHint.OneByOne;
                    continue mainLoop;
                }
            }

            if (this.options.autoReveal) {
                for (const tableau of this.tableaux) {
                    const card = tableau.peek();
                    if (card && !card.faceUp) {
                        card.faceUp = true;
                        yield DelayHint.OneByOne;
                        continue mainLoop;
                    }
                }
            }

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
