import { error } from "~CardLib/Debug";
import { GamePresenterBase } from "~CardLib/Presenter/GamePresenterBase";
import { IView } from "~CardLib/View/IView";
import { PileView } from "~CardLib/View/PileView";
import { Rect } from "~CardLib/View/Rect";
import { IGame } from "../Model/IGame";

// The gap/margin between columns in REM
const margin = 1.5;

/**
 * Maps the 28 peak pile card indices to row and column coordinates.
 * - Row 1 (index 0..2): 3 cards spaced horizontally.
 * - Row 2 (index 3..8): 6 cards grouped under the 3 peaks.
 * - Row 3 (index 9..17): 9 cards forming the third layer.
 * - Row 4 (index 18..27): 10 cards spanning from column index 0.0 to 9.0.
 *
 * Column coordinates range from 0.0 to 9.0 inclusive, which spans exactly 10 columns.
 */
function getPeakCoords(index: number): { col: number; row: number } {
    if (index >= 0 && index <= 2) {
        // Row 1
        return { col: 1.5 + index * 3.0, row: 0 };
    } else if (index >= 3 && index <= 8) {
        // Row 2
        const sub = index - 3;
        const peakGroup = Math.floor(sub / 2);
        const localCol = sub % 2; // 0 or 1
        return { col: 1.0 + peakGroup * 3.0 + localCol, row: 1 };
    } else if (index >= 9 && index <= 17) {
        // Row 3
        const sub = index - 9;
        return { col: 0.5 + sub, row: 2 };
    } else {
        // Row 4
        const sub = index - 18;
        return { col: sub, row: 3 };
    }
}

export class GamePresenter extends GamePresenterBase<IGame> {
    // Initial size constraints, which will be dynamically calculated upon creation and resize.
    // Uses the precise card factor (1.5555555555555) defined in the base class for card aspect ratio.
    private sizeY = 20;
    private sizeX = 20 / 1.5555555555555;

    private readonly stockPile_: PileView;
    private readonly wastePile_: PileView;
    private readonly peakPiles_: PileView[] = [];

    protected get saveDataKey_() {
        return JSON.stringify({
            gameName: "tripeaks",
            version: 0,
            options: this.game_.options.saveKey,
        });
    }

    constructor(game: IGame, rootView: IView) {
        super(game, rootView);

        // Compute and apply the dynamic responsive sizes first
        this.updateSizes_();

        // create stock pile
        {
            const pileView = this.createPileView_(game.stock);
            pileView.showFrame = true;
            pileView.zIndex = 500;
            this.stockPile_ = pileView;
        }

        // create waste pile
        {
            const pileView = this.createPileView_(game.waste);
            pileView.showFrame = true;
            pileView.zIndex = 600;
            this.wastePile_ = pileView;
        }

        // create peak piles
        for (let i = 0; i < game.peaks.length; ++i) {
            const pile = game.peaks[i] ?? error();
            const pileView = this.createPileView_(pile);
            const coords = getPeakCoords(i);
            pileView.zIndex = 100 * (coords.row + 1);
            this.peakPiles_.push(pileView);
        }

        // create cards
        for (const card of game.cards) {
            this.createCardView_(card);
        }

        this.layoutPiles_();
        this.relayoutAll_();
    }

    /**
     * Calculates card sizes dynamically based on screen width.
     * Passes a max-column count of 10 to standard responsive sizing,
     * as the peak layout spans exactly 10 columns (from col 0.0 to 9.0).
     */
    private updateSizes_() {
        const { sizeX, sizeY } = this.calculateCardSize(10, margin);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    protected onResize_() {
        this.updateSizes_();
        this.layoutPiles_();
        this.relayoutAll_();
    }

    /**
     * Positions piles within the card table.
     * The peak columns range from 0.0 to 9.0, meaning the midpoint of the layout is 4.5.
     * Subtracting 4.5 from the column coordinate centers the entire peak layout horizontally.
     */
    private layoutPiles_() {
        const scale = this.sizeY / 20;
        const scaledMargin = margin * scale;
        const rowOffset = this.sizeY * 0.45;

        const xPos = (col: number) => (col - 4.5) * (this.sizeX + scaledMargin);
        const yPos = (row: number) => (row - 1.5) * rowOffset;

        // Stock and waste positioned at the bottom centered
        {
            const pileView = this.stockPile_;
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPos(3.5), yPos(4.3));
        }
        {
            const pileView = this.wastePile_;
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPos(5.5), yPos(4.3));
        }

        // Layout peaks
        for (let i = 0; i < this.game_.peaks.length; ++i) {
            const pileView = this.peakPiles_[i] ?? error();
            const coords = getPeakCoords(i);
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPos(coords.col), yPos(coords.row));
        }
    }
}
