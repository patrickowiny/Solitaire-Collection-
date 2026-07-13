import { IGameInfo } from "~CardLib/IGameInfo";
import { GamePresenterFactory } from "./Presenter/GamePresenterFactory";

class GameInfo implements IGameInfo {
    public gameId = "kingalbert";
    public gameName = "King Albert";
    public gamePresenterFactory = new GamePresenterFactory();
}

export default new GameInfo();
