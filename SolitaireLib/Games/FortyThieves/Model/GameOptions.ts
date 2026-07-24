import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";
import * as URLSearchParamsEx from "~CardLib/URLSearchParamsEx";

export class GameOptions extends GameOptionsBase {
    public restocksAllowed = 0; // Default to 0 restocks (1 pass through the deck)
    public autoReveal = true;
    public autoPlayStock = true;
    public autoMoveToFoundation = 2;

    public moveSequences = false;
    public dealAcesFirst = false;
    public columnsCount = 10;
    public cardsPerColumn = 4;
    public buildAlternatingColor = false;
    public cardsFaceDown = false;
    public cardsFaceUp = 4;
    public blockadeMode = false;

    public get saveKey() {
        return {
            restocksAllowed: this.restocksAllowed,
            moveSequences: this.moveSequences,
            dealAcesFirst: this.dealAcesFirst,
            columnsCount: this.columnsCount,
            cardsPerColumn: this.cardsPerColumn,
            buildAlternatingColor: this.buildAlternatingColor,
            cardsFaceDown: this.cardsFaceDown,
            cardsFaceUp: this.cardsFaceUp,
            blockadeMode: this.blockadeMode,
        };
    }

    constructor(params: URLSearchParams) {
        super();
        this.restocksAllowed = URLSearchParamsEx.getNumber(params, "restocksAllowed", 0);
        this.autoReveal = URLSearchParamsEx.getBool(params, "autoReveal", true);
        this.autoPlayStock = URLSearchParamsEx.getBool(params, "autoPlayStock", true);
        this.autoMoveToFoundation = Math.max(0, URLSearchParamsEx.getNumber(params, "autoMoveToFoundation", 2));

        this.moveSequences = URLSearchParamsEx.getBool(params, "moveSequences", false);
        this.dealAcesFirst = URLSearchParamsEx.getBool(params, "dealAcesFirst", false);
        this.columnsCount = URLSearchParamsEx.getNumber(params, "columnsCount", 10);
        this.cardsPerColumn = URLSearchParamsEx.getNumber(params, "cardsPerColumn", 4);
        this.buildAlternatingColor = URLSearchParamsEx.getBool(params, "buildAlternatingColor", false);
        this.cardsFaceDown = URLSearchParamsEx.getBool(params, "cardsFaceDown", false);
        this.cardsFaceUp = URLSearchParamsEx.getNumber(params, "cardsFaceUp", 4);
        this.blockadeMode = URLSearchParamsEx.getBool(params, "blockadeMode", false);
    }

    public toURLSearchParams(): URLSearchParams {
        const params = new URLSearchParams();
        URLSearchParamsEx.setNumber(params, "restocksAllowed", this.restocksAllowed, 0);
        URLSearchParamsEx.setBool(params, "autoReveal", this.autoReveal, true);
        URLSearchParamsEx.setBool(params, "autoPlayStock", this.autoPlayStock, true);
        URLSearchParamsEx.setNumber(params, "autoMoveToFoundation", this.autoMoveToFoundation, 2);

        URLSearchParamsEx.setBool(params, "moveSequences", this.moveSequences, false);
        URLSearchParamsEx.setBool(params, "dealAcesFirst", this.dealAcesFirst, false);
        URLSearchParamsEx.setNumber(params, "columnsCount", this.columnsCount, 10);
        URLSearchParamsEx.setNumber(params, "cardsPerColumn", this.cardsPerColumn, 4);
        URLSearchParamsEx.setBool(params, "buildAlternatingColor", this.buildAlternatingColor, false);
        URLSearchParamsEx.setBool(params, "cardsFaceDown", this.cardsFaceDown, false);
        URLSearchParamsEx.setNumber(params, "cardsFaceUp", this.cardsFaceUp, 4);
        URLSearchParamsEx.setBool(params, "blockadeMode", this.blockadeMode, false);
        return params;
    }
}
