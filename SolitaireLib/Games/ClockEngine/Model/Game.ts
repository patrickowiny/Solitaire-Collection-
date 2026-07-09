import prand from "pure-rand";
import { error } from "~CardLib/Debug";
import { Card } from "~CardLib/Model/Card";
import { Colour } from "~CardLib/Model/Colour";
import * as DeckUtils from "~CardLib/Model/DeckUtils";
import { DelayHint } from "~CardLib/Model/DelayHint";
import { GameBase } from "~CardLib/Model/GameBase";
import { Pile } from "~CardLib/Model/Pile";
import { Rank } from "~CardLib/Model/Rank";
import { Suit } from "~CardLib/Model/Suit";
import { GameOptions } from "./GameOptions";
import { IGame } from "./IGame";
import { ICard } from "~CardLib/Model/ICard";

export class Game extends GameBase implements IGame {
    public readonly options: GameOptions;
    public readonly foundations: Pile[] = [];
    public readonly tableaux: Pile[] = [];
    public readonly stock: Pile | undefined;
    public readonly waste: Pile | undefined;
    
    // Internal mapping of hour index to target rank for Grandfather's Clock
    private readonly clockTargets_: Rank[] = [
        Rank.Ace, Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six,
        Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen
    ];

    constructor(options: GameOptions) {
        super();
        this.options = options;
        
        if (this.options.engineMode === "grandfather") {
            // No stock or waste visible
            for (let i = 0; i < 12; ++i) {
                const pile = new Pile(this);
                this.foundations.push(pile);
                this.piles.push(pile);
            }
            for (let i = 0; i < 8; ++i) {
                const pile = new Pile(this);
                this.tableaux.push(pile);
                this.piles.push(pile);
            }
            this.cards = DeckUtils.createStandard52Deck(this.tableaux[0]!);
        } else {
            this.stock = new Pile(this);
            this.waste = new Pile(this);
            this.piles.push(this.stock);
            this.piles.push(this.waste);
            for (let i = 0; i < 4; ++i) {
                const pile = new Pile(this);
                this.foundations.push(pile);
                this.piles.push(pile);
            }
            for (let i = 0; i < 6; ++i) {
                const pile = new Pile(this);
                this.tableaux.push(pile);
                this.piles.push(pile);
            }
            this.cards = DeckUtils.createStandard52Deck(this.stock!);
        }
    }

    public get wonCards(): ICard[] {
        const cards: ICard[] = [];
        for (const pile of this.foundations) {
            for (const card of pile) {
                cards.push(card);
            }
        }
        return cards;
    }

    protected doGetWon_(): boolean {
        return this.wonCards.length === 52;
    }

    private getRankValue_(rank: Rank): number {
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

    protected *restart_(rng: prand.RandomGenerator) {
        // Move all cards to a temporary pile (tableaux[0] or stock) for shuffling
        const tempPile = this.stock ?? this.tableaux[0]!;
        for (const pile of this.piles) {
            if (pile === tempPile) continue;
            for (let i = pile.length; i-- > 0;) {
                const card = pile.at(i);
                card.faceUp = false;
                tempPile.push(card);
            }
        }
        for (const card of tempPile) {
            card.faceUp = false;
        }
        tempPile.sort();

        if (this.options.engineMode === "grandfather") {
            const seedRanks = [
                Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven,
                Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King
            ];
            const seedSuits = [
                Suit.Diamonds, Suit.Spades, Suit.Hearts, Suit.Clubs,
                Suit.Diamonds, Suit.Spades, Suit.Hearts, Suit.Clubs,
                Suit.Diamonds, Suit.Spades, Suit.Hearts, Suit.Clubs
            ];

            // Extract seeds
            for (let i = 0; i < 12; i++) {
                const rank = seedRanks[i];
                const suit = seedSuits[i];
                let foundCard: Card | null = null;
                for (const card of tempPile) {
                    if (card.rank === rank && card.suit === suit) {
                        foundCard = card;
                        break;
                    }
                }
                if (foundCard) {
                    this.foundations[i]!.push(foundCard);
                    foundCard.faceUp = true;
                }
            }

            // Shuffle the remaining 40 cards
            tempPile.shuffle(rng);
            
            // Deal 5 to each tableau
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 8; j++) {
                    const card = tempPile.peek();
                    if (card) {
                        this.tableaux[j]!.push(card);
                        card.faceUp = true;
                        yield DelayHint.Quick;
                    }
                }
            }
        } else {
            // Simplicity Mode
            tempPile.shuffle(rng);
            
            // Deal 1 to each tableau
            for (let j = 0; j < 6; j++) {
                const card = tempPile.peek();
                if (card) {
                    this.tableaux[j]!.push(card);
                    card.faceUp = true;
                    yield DelayHint.Quick;
                }
            }
            
            // Remaining cards are in stock
        }
        yield DelayHint.Settle;
    }

    protected *cardPrimary_(card: Card) {
        if (this.canDrag_(card).canDrag) {
            for (const foundation of this.foundations) {
                if (this.previewDrop_(card, foundation)) {
                    yield* this.dropCard_(card, foundation);
                    return;
                }
            }
        }
    }

    protected *cardSecondary_(card: Card) {
        // Nothing for now
    }

    protected *pilePrimary_(pile: Pile) {
        if (this.options.engineMode === "simplicity" && pile === this.stock) {
            if (this.stock.length > 0) {
                for (let i = 0; i < 6; i++) {
                    const card = this.stock.peek();
                    if (card) {
                        this.tableaux[i]!.push(card);
                        card.faceUp = true;
                        yield DelayHint.Quick;
                    }
                }
                yield DelayHint.OneByOne;
            }
        }
    }

    protected *pileSecondary_(pile: Pile) {
        // Nothing
    }

    protected canDrag_(card: Card): { canDrag: boolean; extraCards: Card[] } {
        if (!card.faceUp) return { canDrag: false, extraCards: [] };
        if (this.foundations.includes(card.pile)) return { canDrag: false, extraCards: [] };

        if (this.tableaux.includes(card.pile)) {
            const movingCards = card.pile.slice(card.pileIndex + 1);
            
            // Check if valid sequence to drag
            if (this.options.engineMode === "grandfather") {
                // Tableaus build down regardless of suit
                let currentVal = this.getRankValue_(card.rank);
                for (const movingCard of movingCards) {
                    const nextVal = this.getRankValue_(movingCard.rank);
                    if (currentVal === 1) currentVal = 14; // Handle King on Ace if needed, though strictly down is usually 13 on 1 or not allowed.
                    // Wait, standard builds down 1 by 1.
                    if (nextVal !== currentVal - 1) return { canDrag: false, extraCards: [] };
                    currentVal = nextVal;
                }
                return { canDrag: true, extraCards: movingCards };
            } else {
                // Simplicity builds down in alternating colors
                let currentVal = this.getRankValue_(card.rank);
                let currentCol = card.colour;
                for (const movingCard of movingCards) {
                    const nextVal = this.getRankValue_(movingCard.rank);
                    const nextCol = movingCard.colour;
                    if (nextVal !== currentVal - 1 || nextCol === currentCol) return { canDrag: false, extraCards: [] };
                    currentVal = nextVal;
                    currentCol = nextCol;
                }
                return { canDrag: true, extraCards: movingCards };
            }
        }
        return { canDrag: true, extraCards: [] };
    }

    protected previewDrop_(card: Card, pile: Pile): boolean {
        if (card.pile === pile) return false;
        
        if (this.foundations.includes(pile)) {
            const extra = this.canDrag_(card).extraCards;
            if (extra.length > 0) return false; // Can only drop 1 card to foundation
            
            if (this.options.engineMode === "grandfather") {
                const fIndex = this.foundations.indexOf(pile);
                const topCard = pile.peek();
                if (!topCard) return false; // In grandfather, foundations are pre-seeded
                
                // Build up by suit until matching target
                if (card.suit !== topCard.suit) return false;
                
                const targetVal = this.getRankValue_(this.clockTargets_[fIndex] ?? Rank.None);
                const topVal = this.getRankValue_(topCard.rank);
                if (topVal === targetVal) return false; // Already full
                
                let nextVal = topVal + 1;
                if (nextVal > 13) nextVal = 1; // Wrap K to A
                
                return this.getRankValue_(card.rank) === nextVal;
            } else {
                // Simplicity foundation
                const topCard = pile.peek();
                if (!topCard) {
                    return card.rank === Rank.Ace;
                }
                return card.suit === topCard.suit && this.getRankValue_(card.rank) === this.getRankValue_(topCard.rank) + 1;
            }
        } else if (this.tableaux.includes(pile)) {
            const topCard = pile.peek();
            if (this.options.engineMode === "grandfather") {
                // Tableaus build down regardless of suit
                if (!topCard) return true; // Can play any card to empty tableau
                let topVal = this.getRankValue_(topCard.rank);
                let cardVal = this.getRankValue_(card.rank);
                return cardVal === topVal - 1;
            } else {
                // Simplicity builds down in alternating colors
                if (!topCard) return true; // Any to empty
                let topVal = this.getRankValue_(topCard.rank);
                let cardVal = this.getRankValue_(card.rank);
                return cardVal === topVal - 1 && topCard.colour !== card.colour;
            }
        }
        return false;
    }

    protected *dropCard_(card: Card, pile: Pile) {
        const sourcePile = card.pile;
        const movingCards = [card, ...this.canDrag_(card).extraCards];
        
        for (const movingCard of movingCards) {
            pile.push(movingCard);
        }
        
        yield DelayHint.OneByOne;
    }
}
