import { IGameInfo } from "~CardLib/IGameInfo";
import { GamePresenterFactory } from "./Presenter/GamePresenterFactory";

class GameInfo implements IGameInfo {
    public gameId = "westcliff";
    public gameName = "Westcliff";
    public gamePresenterFactory = new GamePresenterFactory();
}

export default new GameInfo();
