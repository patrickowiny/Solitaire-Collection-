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

    private readonly stockPile_: PileView;
    private readonly wastePile_: PileView;
    private readonly trunkPile_: PileView;
    private readonly foundationPiles_: PileView[] = [];
    private readonly tableauPiles_: PileView[] = [];

    protected get saveDataKey_() {
        return JSON.stringify({
            gameName: "eaglewing",
            version: 0,
            options: this.game_.options.saveKey,
        });
    }

    constructor(game: IGame, rootView: IView) {
        super(game, rootView);

        this.updateSizes_();

        // create piles:
        {
            const pileView = this.createPileView_(game.stock);
            pileView.showFrame = true;
            this.stockPile_ = pileView;
        }
        {
            const pileView = this.createPileView_(game.waste);
            pileView.showFrame = true;
            pileView.zIndex = 50;
            this.wastePile_ = pileView;
        }
        {
            const pileView = this.createPileView_(game.trunk);
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.trunkPile_ = pileView;
        }
        for (let i = 0; i < this.game_.foundations.length; ++i) {
            const pileView = this.createPileView_(game.foundations[i] ?? error());
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.foundationPiles_.push(pileView);
        }
        for (let i = 0; i < this.game_.tableaux.length; ++i) {
            const pileView = this.createPileView_(game.tableaux[i] ?? error());
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.tableauPiles_.push(pileView);
        }

        // create cards:
        for (const card of game.cards) {
            this.createCardView_(card);
        }

        this.layoutPiles_();
        this.relayoutAll_();
    }

    private updateSizes_() {
        const { sizeX, sizeY } = this.calculateCardSize(9, margin);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    protected onResize_() {
        this.updateSizes_();
        this.layoutPiles_();
        this.relayoutAll_();
    }

    private layoutPiles_() {
        const tableSize = 9;
        const scale = this.sizeY / 20;
        const scaledMargin = margin * scale;

        let vExpand = 1;
        if (window.matchMedia("screen and (max-aspect-ratio: 100/130)").matches) {
            vExpand = 1.5;
        }
        const xPos = (i: number) => {
            return (i - 0.5 * (tableSize - 1)) * (this.sizeX + scaledMargin);
        };

        const yTop = vExpand * -35 * scale + scaledMargin;
        const yBottom = yTop + scaledMargin + this.sizeY + scaledMargin;

        // Row 1: Foundations in columns 2, 3, 4, 5
        for (let i = 0; i < this.game_.foundations.length; ++i) {
            const pile = this.game_.foundations[i] ?? error();
            const pileView = this.getPileView_(pile);
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPos(i + 2), yTop);
        }

        // Row 1: Waste in column 7, Stock in column 8
        {
            const pile = this.game_.waste;
            const pileView = this.getPileView_(pile);
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPos(7), yTop);
            pileView.fanXUp = 3 * scale;
        }
        {
            const pile = this.game_.stock;
            const pileView = this.getPileView_(pile);
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPos(8), yTop);
        }

        // Row 2: Trunk in column 4
        {
            const pile = this.game_.trunk;
            const pileView = this.getPileView_(pile);
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPos(4), yBottom);
        }

        // Row 2: Left wings (Tableaux 0-3) in columns 0-3
        for (let i = 0; i < 4; ++i) {
            const pile = this.game_.tableaux[i] ?? error();
            const pileView = this.getPileView_(pile);
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPos(i), yBottom);
            pileView.fanYDown = 3.5 * scale;
            pileView.fanYUp = vExpand * 3.5 * scale;
        }

        // Row 2: Right wings (Tableaux 4-7) in columns 5-8
        for (let i = 4; i < 8; ++i) {
            const pile = this.game_.tableaux[i] ?? error();
            const pileView = this.getPileView_(pile);
            pileView.rect = new Rect(this.sizeX, this.sizeY, xPos(i + 1), yBottom);
            pileView.fanYDown = 3.5 * scale;
            pileView.fanYUp = vExpand * 3.5 * scale;
        }
    }
}
