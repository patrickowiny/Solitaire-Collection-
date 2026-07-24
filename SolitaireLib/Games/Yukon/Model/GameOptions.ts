import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";
import * as URLSearchParamsEx from "~CardLib/URLSearchParamsEx";

export class GameOptions extends GameOptionsBase {
    public autoReveal = true;
    public autoMoveToFoundation = 2;
    public buildInSuit = false;

    public get saveKey() {
        return {
            autoReveal: this.autoReveal,
            autoMoveToFoundation: this.autoMoveToFoundation,
            buildInSuit: this.buildInSuit,
        };
    }

    constructor(params: URLSearchParams) {
        super();
        this.autoReveal = URLSearchParamsEx.getBool(params, "autoReveal", true);
        this.autoMoveToFoundation = Math.max(0, URLSearchParamsEx.getNumber(params, "autoMoveToFoundation", 2));
        this.buildInSuit = URLSearchParamsEx.getBool(params, "buildInSuit", false);
    }

    public toURLSearchParams(): URLSearchParams {
        const params = new URLSearchParams();
        URLSearchParamsEx.setBool(params, "autoReveal", this.autoReveal, true);
        URLSearchParamsEx.setNumber(params, "autoMoveToFoundation", this.autoMoveToFoundation, 2);
        URLSearchParamsEx.setBool(params, "buildInSuit", this.buildInSuit, false);
        return params;
    }
}
