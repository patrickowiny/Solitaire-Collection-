import { IGamePresenter } from "~CardLib/Presenter/IGamePresenter";
import { IGamePresenterFactory } from "~CardLib/Presenter/IGamePresenterFactory";
import { RootView } from "~CardLib/View/RootView";
import { Game } from "../Model/Game";
import { GameOptions } from "../Model/GameOptions";
import { GamePresenter } from "./GamePresenter";

export class GamePresenterFactory implements IGamePresenterFactory {
    public createGame(container: HTMLElement, params: URLSearchParams): IGamePresenter {
        const options = new GameOptions(params);
        const game = new Game(options);
        const rootView = new RootView(container);
        return new GamePresenter(game, rootView);
    }
}
