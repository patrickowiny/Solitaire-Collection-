import { IGameInfo } from "~CardLib/IGameInfo";
import { GamePresenterFactory } from "./Presenter/GamePresenterFactory";

const GameInfo: IGameInfo = {
    gameId: "clockengine",
    gameName: "Grandfather's Clock & Simplicity",
    gamePresenterFactory: new GamePresenterFactory(),
};

export default GameInfo;
