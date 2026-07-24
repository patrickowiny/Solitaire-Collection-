import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";
import * as URLSearchParamsEx from "~CardLib/URLSearchParamsEx";

export class GameOptions extends GameOptionsBase {
    public autoReveal = true;
    public autoMoveToFoundation = 2;
    public stockDraws = 0; // 0 = standard deal to all tableau, 1 or 3 = draw to waste
    public restocksAllowed = 0;

    public get saveKey() {
        return {
            autoReveal: this.autoReveal,
            autoMoveToFoundation: this.autoMoveToFoundation,
            stockDraws: this.stockDraws,
            restocksAllowed: this.restocksAllowed,
        };
    }

    constructor(params: URLSearchParams) {
        super();
        this.autoReveal = URLSearchParamsEx.getBool(params, "autoReveal", true);
        this.autoMoveToFoundation = Math.max(0, URLSearchParamsEx.getNumber(params, "autoMoveToFoundation", 2));
        this.stockDraws = URLSearchParamsEx.getNumber(params, "stockDraws", 0);
        this.restocksAllowed = URLSearchParamsEx.getNumber(params, "restocksAllowed", 0);
    }

    public toURLSearchParams(): URLSearchParams {
        const params = new URLSearchParams();
        URLSearchParamsEx.setBool(params, "autoReveal", this.autoReveal, true);
        URLSearchParamsEx.setNumber(params, "autoMoveToFoundation", this.autoMoveToFoundation, 2);
        URLSearchParamsEx.setNumber(params, "stockDraws", this.stockDraws, 0);
        URLSearchParamsEx.setNumber(params, "restocksAllowed", this.restocksAllowed, 0);
        return params;
    }
}
