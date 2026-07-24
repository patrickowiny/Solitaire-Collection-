import { error } from "~CardLib/Debug";
import { GamePresenterBase } from "~CardLib/Presenter/GamePresenterBase";
import { IView } from "~CardLib/View/IView";
import { PileView } from "~CardLib/View/PileView";
import { Rect } from "~CardLib/View/Rect";
import { IGame } from "../Model/IGame";

const margin = 1;

export class GamePresenter extends GamePresenterBase<IGame> {
    private sizeY = 20;
    private sizeX = 20 / 1.555555555555;

    private readonly tableauPiles_: PileView[] = [];
    private readonly freecellPiles_: PileView[] = [];
    private readonly foundationPiles_: PileView[] = [];

    protected get saveDataKey_() {
        return JSON.stringify({
            gameName: "freecell",
            version: 0,
            options: this.game_.options.saveKey,
        });
    }

    constructor(game: IGame, rootView: IView) {
        super(game, rootView);

        this.updateSizes_();

        // Tableau piles:
        for (let i = 0; i < this.game_.tableaux.length; ++i) {
            const pileView = this.createPileView_(game.tableaux[i] ?? error());
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.tableauPiles_.push(pileView);
        }

        // Free cells:
        for (let i = 0; i < this.game_.freecells.length; ++i) {
            const pileView = this.createPileView_(game.freecells[i] ?? error());
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.freecellPiles_.push(pileView);
        }

        // Foundations:
        for (let i = 0; i < this.game_.foundations.length; ++i) {
            const pileView = this.createPileView_(game.foundations[i] ?? error());
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.foundationPiles_.push(pileView);
        }

        // Create cards:
        for (const card of game.cards) {
            this.createCardView_(card);
        }

        this.layoutPiles_();
        this.relayoutAll_();
    }

    private updateSizes_() {
        const maxColumns = Math.max(
            this.game_.tableaux.length,
            this.game_.freecells.length + this.game_.foundations.length
        );
        const { sizeX, sizeY } = this.calculateCardSize(maxColumns, margin);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    protected onResize_() {
        this.updateSizes_();
        this.layoutPiles_();
        this.relayoutAll_();
    }

    private layoutPiles_() {
        const maxColumns = Math.max(
            this.game_.tableaux.length,
            this.game_.freecells.length + this.game_.foundations.length
        );
        const scale = this.sizeY / 20;
        const scaledMargin = margin * scale;

        let vExpand = 1;
        if (window.matchMedia("screen and (max-aspect-ratio: 100/130)").matches) {
            vExpand = 1.5;
        }

        const xPosTop = (colIndex: number) => {
            return (colIndex - 0.5 * (maxColumns - 1)) * (this.sizeX + scaledMargin);
        };

        const xPosBottom = (colIndex: number) => {
            return (colIndex - 0.5 * (this.game_.tableaux.length - 1)) * (this.sizeX + scaledMargin);
        };

        const topY = vExpand * -35 * scale + scaledMargin;
        const bottomY = topY + this.sizeY + scaledMargin * 2;

        // Row 1 (Top): Free cells on left side
        for (let i = 0; i < this.game_.freecells.length; ++i) {
            const pile = this.game_.freecells[i] ?? error();
            const pileView = this.getPileView_(pile);
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPosTop(i), topY);
        }

        // Row 1 (Top): Foundations on right side
        for (let i = 0; i < this.game_.foundations.length; ++i) {
            const pile = this.game_.foundations[i] ?? error();
            const pileView = this.getPileView_(pile);
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPosTop(maxColumns - this.game_.foundations.length + i), topY);
        }

        // Row 2 (Bottom): Tableau stacks arranged horizontally directly beneath
        for (let i = 0; i < this.game_.tableaux.length; ++i) {
            const pile = this.game_.tableaux[i] ?? error();
            const pileView = this.getPileView_(pile);
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPosBottom(i), bottomY);
            pileView.fanYDown = 3.5 * scale;
            pileView.fanYUp = vExpand * 3.5 * scale;
        }
    }
}
