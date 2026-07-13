import { IGameInfo } from "~CardLib/IGameInfo";
import { GamePresenterFactory } from "./Presenter/GamePresenterFactory";

class GameInfo implements IGameInfo {
    public gameId = "eaglewing";
    public gameName = "EagleWing";
    public gamePresenterFactory = new GamePresenterFactory();
}

export default new GameInfo();
