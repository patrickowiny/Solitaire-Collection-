import * as MathEx from "~CardLib/MathEx";
import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";
import * as URLSearchParamsEx from "~CardLib/URLSearchParamsEx";

export class GameOptions extends GameOptionsBase {
    public engineMode: "grandfather" | "simplicity" = "grandfather";

    public get saveKey() {
        return {
            engineMode: this.engineMode,
        };
    }

    constructor(params: URLSearchParams) {
        super();
        const mode = params.get("engineMode");
        if (mode === "grandfather" || mode === "simplicity") {
            this.engineMode = mode;
        }
    }

    public toURLSearchParams(): URLSearchParams {
        const params = new URLSearchParams();
        if (this.engineMode !== "grandfather") {
            params.set("engineMode", this.engineMode);
        }
        return params;
    }
}
