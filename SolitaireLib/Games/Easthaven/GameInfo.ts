import { IGameInfo } from "~CardLib/IGameInfo";
import { GamePresenterFactory } from "./Presenter/GamePresenterFactory";

class GameInfo implements IGameInfo {
    public gameId = "easthaven";
    public gameName = "Easthaven";
    public gamePresenterFactory = new GamePresenterFactory();
}

export default new GameInfo();
