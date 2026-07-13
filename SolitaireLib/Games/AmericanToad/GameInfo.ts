import { IGameInfo } from "~CardLib/IGameInfo";
import { GamePresenterFactory } from "./Presenter/GamePresenterFactory";

class GameInfo implements IGameInfo {
    public gameId = "americantoad";
    public gameName = "American Toad";
    public gamePresenterFactory = new GamePresenterFactory();
}

export default new GameInfo();
