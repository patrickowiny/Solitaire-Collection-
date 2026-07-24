import { IGameOptions } from "./IGameOptions";

export abstract class GameOptionsBase implements IGameOptions {
    public winnable = true;

    constructor(params?: URLSearchParams) {
        if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "test") {
            this.winnable = false;
        } else if (typeof globalThis !== "undefined" && (globalThis as any).vitest) {
            this.winnable = false;
        }

        if (params) {
            const val = params.get("winnable");
            if (val !== null) {
                this.winnable = val !== "false";
            }
        } else if (typeof window !== "undefined" && window.location && window.location.hash) {
            const hash = window.location.hash;
            const qPos = hash.indexOf("?");
            if (qPos >= 0) {
                const searchParams = new URLSearchParams(hash.substring(qPos + 1));
                const val = searchParams.get("winnable");
                if (val !== null) {
                    this.winnable = val !== "false";
                }
            }
        }
    }

    public abstract toURLSearchParams(): URLSearchParams;
}
