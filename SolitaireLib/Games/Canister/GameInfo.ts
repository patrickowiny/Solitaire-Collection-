import { IGameInfo } from "~CardLib/IGameInfo";
import { GamePresenterFactory } from "./Presenter/GamePresenterFactory";

class GameInfo implements IGameInfo {
    public gameId = "canister";
    public gameName = "Canister";
    public gamePresenterFactory = new GamePresenterFactory();
}

export default new GameInfo();
