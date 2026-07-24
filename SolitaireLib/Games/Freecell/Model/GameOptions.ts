import * as MathEx from "~CardLib/MathEx";
import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";
import * as URLSearchParamsEx from "~CardLib/URLSearchParamsEx";

export class GameOptions extends GameOptionsBase {
    public autoReveal = true;
    public autoMoveToFoundation = 2;

    public cellsCount = 4;
    public decksCount = 1;
    public columnsCount = 8;
    public emptyTableauKingsOnly = false;

    public get saveKey() {
        return {
            autoReveal: this.autoReveal,
            autoMoveToFoundation: this.autoMoveToFoundation,
            cellsCount: this.cellsCount,
            decksCount: this.decksCount,
            columnsCount: this.columnsCount,
            emptyTableauKingsOnly: this.emptyTableauKingsOnly,
        };
    }

    constructor(params: URLSearchParams) {
        super();
        this.autoReveal = URLSearchParamsEx.getBool(params, "autoReveal", true);
        this.autoMoveToFoundation = Math.max(0, URLSearchParamsEx.getNumber(params, "autoMoveToFoundation", 2));

        this.cellsCount = MathEx.clamp(URLSearchParamsEx.getNumber(params, "cellsCount", 4), 1, 8);
        this.decksCount = MathEx.clamp(URLSearchParamsEx.getNumber(params, "decksCount", 1), 1, 3);
        this.columnsCount = MathEx.clamp(URLSearchParamsEx.getNumber(params, "columnsCount", 8), 4, 12);
        this.emptyTableauKingsOnly = URLSearchParamsEx.getBool(params, "emptyTableauKingsOnly", false);
    }

    public toURLSearchParams(): URLSearchParams {
        const params = new URLSearchParams();
        URLSearchParamsEx.setBool(params, "autoReveal", this.autoReveal, true);
        URLSearchParamsEx.setNumber(params, "autoMoveToFoundation", this.autoMoveToFoundation, 2);

        URLSearchParamsEx.setNumber(params, "cellsCount", this.cellsCount, 4);
        URLSearchParamsEx.setNumber(params, "decksCount", this.decksCount, 1);
        URLSearchParamsEx.setNumber(params, "columnsCount", this.columnsCount, 8);
        URLSearchParamsEx.setBool(params, "emptyTableauKingsOnly", this.emptyTableauKingsOnly, false);
        return params;
    }
}
