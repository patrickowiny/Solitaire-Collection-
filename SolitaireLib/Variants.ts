import { IGameInfo } from "~CardLib/IGameInfo";
import { IGamePresenter } from "~CardLib/Presenter/IGamePresenter";
import { IGamePresenterFactory } from "~CardLib/Presenter/IGamePresenterFactory";

import Klondike from "./Games/Klondike/GameInfo";
import Easthaven from "./Games/Easthaven/GameInfo";
import Carpet from "./Games/Carpet/GameInfo";
import Martha from "./Games/Martha/GameInfo";
import Bristol from "./Games/Bristol/GameInfo";
import FlowerGarden from "./Games/FlowerGarden/GameInfo";
import Cruel from "./Games/Cruel/GameInfo";
import AuldLangSyne from "./Games/AuldLangSyne/GameInfo";
import PussInTheCorner from "./Games/PussInTheCorner/GameInfo";
import KlondikeEx from "./Games/KlondikeEx/GameInfo";
import Canister from "./Games/Canister/GameInfo";
import Agnes from "./Games/Agnes/GameInfo";
import AustralianPatience from "./Games/AustralianPatience/GameInfo";
import Pyramid from "./Games/Pyramid/GameInfo";
import Fortress from "./Games/Fortress/GameInfo";
import Penguin from "./Games/Penguin/GameInfo";
import Giza from "./Games/Giza/GameInfo";
import Golf from "./Games/Golf/GameInfo";
import ClockEngine from "./Games/ClockEngine/GameInfo";
import AcesUp from "./Games/AcesUp/GameInfo";
import Calculation from "./Games/Calculation/GameInfo";
import Canfield from "./Games/Canfield/GameInfo";
import Deuces from "./Games/Deuces/GameInfo";
import FortyEight from "./Games/FortyEight/GameInfo";
import Freecell from "./Games/Freecell/GameInfo";
import SeahavenTowers from "./Games/SeahavenTowers/GameInfo";
import BakersGame from "./Games/BakersGame/GameInfo";
import BakersDozen from "./Games/BakersDozen/GameInfo";
import EightOff from "./Games/EightOff/GameInfo";
import Yukon from "./Games/Yukon/GameInfo";
import RussianSolitaire from "./Games/RussianSolitaire/GameInfo";
import Gypsy from "./Games/Gypsy/GameInfo";
import Maze from "./Games/Maze/GameInfo";
import FortyThieves from "./Games/FortyThieves/GameInfo";
import Spider from "./Games/Spider/GameInfo";
import Spiderette from "./Games/Spiderette/GameInfo";
import TriPeaks from "./Games/TriPeaks/GameInfo";
import Scorpion from "./Games/Scorpion/GameInfo";
import SimpleSimon from "./Games/SimpleSimon/GameInfo";
import BeleagueredCastle from "./Games/BeleagueredCastle/GameInfo";
import StreetsAndAlleys from "./Games/StreetsAndAlleys/GameInfo";
import Sultan from "./Games/Sultan/GameInfo";
import Terrace from "./Games/Terrace/GameInfo";
import Accordion from "./Games/Accordion/GameInfo";
import Westcliff from "./Games/Westcliff/GameInfo";
import BlackHole from "./Games/BlackHole/GameInfo";
import Osmosis from "./Games/Osmosis/GameInfo";
import LaBelleLucie from "./Games/LaBelleLucie/GameInfo";
import Duchess from "./Games/Duchess/GameInfo";
import EagleWing from "./Games/EagleWing/GameInfo";
import Colorado from "./Games/Colorado/GameInfo";
import AmericanToad from "./Games/AmericanToad/GameInfo";
import KingAlbert from "./Games/KingAlbert/GameInfo";
import CrazyQuilt from "./Games/CrazyQuilt/GameInfo";

class VariantPresenterFactory implements IGamePresenterFactory {
    private readonly baseFactory_: IGamePresenterFactory;
    private readonly extraParams_: Record<string, string>;

    constructor(baseFactory: IGamePresenterFactory, extraParams: Record<string, string>) {
        this.baseFactory_ = baseFactory;
        this.extraParams_ = extraParams;
    }

    public createGame(parentElement: HTMLElement, searchParams: URLSearchParams): IGamePresenter {
        const mergedParams = new URLSearchParams(searchParams);
        for (const [key, value] of Object.entries(this.extraParams_)) {
            mergedParams.set(key, value);
        }
        return this.baseFactory_.createGame(parentElement, mergedParams);
    }
}

interface VariantDefinition {
    id: string;
    name: string;
    base: IGameInfo;
    params: Record<string, string>;
}

const definitions: VariantDefinition[] = [
    // 1-7. Klondike Variants
    { id: "klondike_draw_1_easy", name: "Klondike Draw 1 (Easy)", base: Klondike, params: { stockDraws: "1", restocksAllowed: "999" } },
    { id: "klondike_draw_1_hard", name: "Klondike Draw 1 (Hard)", base: Klondike, params: { stockDraws: "1", restocksAllowed: "0" } },
    { id: "klondike_draw_3_easy", name: "Klondike Draw 3 (Easy)", base: Klondike, params: { stockDraws: "3", restocksAllowed: "999" } },
    { id: "klondike_draw_3_hard", name: "Klondike Draw 3 (Hard)", base: Klondike, params: { stockDraws: "3", restocksAllowed: "1" } },
    { id: "klondike_draw_2", name: "Klondike (Draw 2)", base: Klondike, params: { stockDraws: "2", restocksAllowed: "999" } },
    { id: "klondike_draw_4", name: "Klondike (Draw 4)", base: Klondike, params: { stockDraws: "4", restocksAllowed: "999" } },
    { id: "klondike_draw_5", name: "Klondike (Draw 5)", base: Klondike, params: { stockDraws: "5", restocksAllowed: "999" } },

    // 8-9. Easthaven Variants
    { id: "easthaven_draw_3", name: "Easthaven (Draw 3)", base: Easthaven, params: { stockDraws: "3" } },
    { id: "easthaven_draw_1_easy", name: "Easthaven Draw 1 (Easy)", base: Easthaven, params: { stockDraws: "1", restocksAllowed: "999" } },

    // 10-13. Canfield Variants
    { id: "canfield_draw_1", name: "Canfield (Draw 1)", base: Canfield, params: { stockDraws: "1" } },
    { id: "canfield_draw_1_hard", name: "Canfield (Draw 1, Hard)", base: Canfield, params: { stockDraws: "1", restocksAllowed: "0" } },
    { id: "canfield_draw_3_hard", name: "Canfield (Draw 3, Hard)", base: Canfield, params: { stockDraws: "3", restocksAllowed: "1" } },
    { id: "canfield_draw_2", name: "Canfield (Draw 2)", base: Canfield, params: { stockDraws: "2" } },

    // 14-16, 26. Forty Thieves Variants
    { id: "forty_thieves_easy", name: "Forty Thieves (Easy)", base: FortyThieves, params: { restocksAllowed: "999" } },
    { id: "forty_thieves_hard", name: "Forty Thieves (Hard)", base: FortyThieves, params: { restocksAllowed: "0" } },
    { id: "forty_thieves_draw_3", name: "Forty Thieves (Draw 3)", base: FortyThieves, params: { restocksAllowed: "3" } },
    { id: "forty_thieves_draw_2", name: "Forty Thieves (Draw 2)", base: FortyThieves, params: { restocksAllowed: "1" } },

    // 17-18. Freecell Variants
    { id: "freecell_easy", name: "Freecell (Easy)", base: Freecell, params: { autoReveal: "true", autoMoveToFoundation: "3" } },
    { id: "freecell_hard", name: "Freecell (Hard)", base: Freecell, params: { autoMoveToFoundation: "0" } },

    // 19. Seahaven Towers Variants
    { id: "seahaven_towers_easy", name: "Seahaven Towers (Easy)", base: SeahavenTowers, params: { autoReveal: "true" } },

    // 20. Bakers Game Variants
    { id: "bakers_game_easy", name: "Baker's Game (Easy)", base: BakersGame, params: { autoReveal: "true" } },

    // 21. Bakers Dozen Variants
    { id: "bakers_dozen_easy", name: "Baker's Dozen (Easy)", base: BakersDozen, params: { autoReveal: "true" } },

    // 22. Eight Off Variants
    { id: "eight_off_easy", name: "Eight Off (Easy)", base: EightOff, params: { autoReveal: "true" } },

    // 23. Yukon Variants
    { id: "yukon_easy", name: "Yukon (Easy)", base: Yukon, params: { autoReveal: "true", autoMoveToFoundation: "3" } },

    // 24. Russian Solitaire Variants
    { id: "russian_solitaire_easy", name: "Russian Solitaire (Easy)", base: RussianSolitaire, params: { autoReveal: "true" } },

    // 25. Gypsy Variants
    { id: "gypsy_easy", name: "Gypsy (Easy)", base: Gypsy, params: { autoReveal: "true" } },

    // 27-28. Spider Variants
    { id: "spider_1_suit", name: "Spider (1 Suit)", base: Spider, params: { suitsCount: "1" } },
    { id: "spider_2_suits", name: "Spider (2 Suits)", base: Spider, params: { suitsCount: "2" } },

    // 29-30. Spiderette Variants
    { id: "spiderette_1_suit", name: "Spiderette (1 Suit)", base: Spiderette, params: { suitsCount: "1" } },
    { id: "spiderette_2_suits", name: "Spiderette (2 Suits)", base: Spiderette, params: { suitsCount: "2" } },

    // 31. Tripeaks Variants
    { id: "tripeaks_easy", name: "TriPeaks (Easy)", base: TriPeaks, params: { autoReveal: "true" } },

    // 32. Scorpion Variants
    { id: "scorpion_easy", name: "Scorpion (Easy)", base: Scorpion, params: { autoReveal: "true" } },

    // 33. Simple Simon Variants
    { id: "simple_simon_easy", name: "Simple Simon (Easy)", base: SimpleSimon, params: { autoReveal: "true" } },

    // 34. Beleaguered Castle Variants
    { id: "beleaguered_castle_easy", name: "Beleaguered Castle (Easy)", base: BeleagueredCastle, params: { autoReveal: "true" } },

    // 35. Streets and Alleys Variants
    { id: "streets_and_alleys_easy", name: "Streets and Alleys (Easy)", base: StreetsAndAlleys, params: { autoReveal: "true" } },

    // 36. Sultan Variants
    { id: "sultan_easy", name: "Sultan (Easy)", base: Sultan, params: { autoReveal: "true" } },

    // 37. Terrace Variants
    { id: "terrace_easy", name: "Terrace (Easy)", base: Terrace, params: { autoReveal: "true" } },

    // 38. Accordion Variants
    { id: "accordion_easy", name: "Accordion (Easy)", base: Accordion, params: { autoReveal: "true" } },

    // 39. Westcliff Variants
    { id: "westcliff_easy", name: "Westcliff (Easy)", base: Westcliff, params: { autoReveal: "true" } },

    // 40. Black Hole Variants
    { id: "black_hole_easy", name: "Black Hole (Easy)", base: BlackHole, params: { autoReveal: "true" } },

    // 41. Osmosis Variants
    { id: "osmosis_easy", name: "Osmosis (Easy)", base: Osmosis, params: { autoReveal: "true" } },

    // 42. La Belle Lucie Variants
    { id: "la_belle_lucie_easy", name: "La Belle Lucie (Easy)", base: LaBelleLucie, params: { autoReveal: "true" } },

    // 43. Duchess Variants
    { id: "duchess_easy", name: "Duchess (Easy)", base: Duchess, params: { autoReveal: "true" } },

    // 44. Eagle Wing Variants
    { id: "eagle_wing_easy", name: "Eagle Wing (Easy)", base: EagleWing, params: { autoReveal: "true" } },

    // 45. Colorado Variants
    { id: "colorado_easy", name: "Colorado (Easy)", base: Colorado, params: { autoReveal: "true" } },

    // 46. American Toad Variants
    { id: "american_toad_easy", name: "American Toad (Easy)", base: AmericanToad, params: { autoReveal: "true" } },

    // 47. King Albert Variants
    { id: "king_albert_easy", name: "King Albert (Easy)", base: KingAlbert, params: { autoReveal: "true" } },

    // 48. Crazy Quilt Variants
    { id: "crazy_quilt_easy", name: "Crazy Quilt (Easy)", base: CrazyQuilt, params: { autoReveal: "true" } },

    // 49. Carpet Variants
    { id: "carpet_easy", name: "Carpet (Easy)", base: Carpet, params: { autoReveal: "true" } },

    // 50. Martha Variants
    { id: "martha_easy", name: "Martha (Easy)", base: Martha, params: { autoReveal: "true" } },

    // 51. Bristol Variants
    { id: "bristol_easy", name: "Bristol (Easy)", base: Bristol, params: { autoReveal: "true" } },

    // 52. Flower Garden Variants
    { id: "flower_garden_easy", name: "Flower Garden (Easy)", base: FlowerGarden, params: { autoReveal: "true" } },

    // 53. Cruel Variants
    { id: "cruel_easy", name: "Cruel (Easy)", base: Cruel, params: { autoReveal: "true" } },

    // 54. Auld Lang Syne Variants
    { id: "auld_lang_syne_easy", name: "Auld Lang Syne (Easy)", base: AuldLangSyne, params: { autoReveal: "true" } },

    // 55. Puss in the Corner Variants
    { id: "puss_in_the_corner_easy", name: "Puss in the Corner (Easy)", base: PussInTheCorner, params: { autoReveal: "true" } },

    // 56. Klondike Ex Variants
    { id: "klondike_ex_easy", name: "Klondike Ex (Easy)", base: KlondikeEx, params: { autoReveal: "true" } },

    // 57. Canister Variants
    { id: "canister_easy", name: "Canister (Easy)", base: Canister, params: { autoReveal: "true" } },

    // 58. Agnes Variants
    { id: "agnes_easy", name: "Agnes (Easy)", base: Agnes, params: { autoReveal: "true" } },

    // 59. Australian Patience Variants
    { id: "australian_patience_easy", name: "Australian Patience (Easy)", base: AustralianPatience, params: { autoReveal: "true" } },

    // 60. Pyramid Variants
    { id: "pyramid_easy", name: "Pyramid (Easy)", base: Pyramid, params: { autoReveal: "true" } },

    // 61. Fortress Variants
    { id: "fortress_easy", name: "Fortress (Easy)", base: Fortress, params: { autoReveal: "true" } },

    // 62. Penguin Variants
    { id: "penguin_easy", name: "Penguin (Easy)", base: Penguin, params: { autoReveal: "true" } },

    // 63. Giza Variants
    { id: "giza_easy", name: "Giza (Easy)", base: Giza, params: { autoReveal: "true" } },

    // 64. Golf Variants
    { id: "golf_easy", name: "Golf (Easy)", base: Golf, params: { autoReveal: "true" } },

    // 65. Clock Engine Variants
    { id: "clock_engine_easy", name: "Clock (Easy)", base: ClockEngine, params: { autoReveal: "true" } },

    // 66. Aces Up Variants
    { id: "aces_up_easy", name: "Aces Up (Easy)", base: AcesUp, params: { autoReveal: "true" } },

    // 67. Calculation Variants
    { id: "calculation_easy", name: "Calculation (Easy)", base: Calculation, params: { autoReveal: "true" } },

    // 68. Deuces Variants
    { id: "deuces_easy", name: "Deuces (Easy)", base: Deuces, params: { autoReveal: "true" } },

    // 69. Forty Eight Variants
    { id: "forty_eight_easy", name: "Forty Eight (Easy)", base: FortyEight, params: { autoReveal: "true" } },

    // 70. Maze Variants
    { id: "maze_easy", name: "Maze (Easy)", base: Maze, params: { autoReveal: "true" } },

    // 71-72. Hard Modes
    { id: "golf_hard", name: "Golf (Hard)", base: Golf, params: { allowKingWrap: "false" } },
    { id: "aces_up_hard", name: "Aces Up (Hard)", base: AcesUp, params: { relaxFilling: "false" } },

    // 73-74. Strict Modes
    { id: "klondike_d3_strict", name: "Klondike Draw 3 (Strict)", base: Klondike, params: { stockDraws: "3", restocksAllowed: "0" } },
    { id: "canfield_d1_strict", name: "Canfield Draw 1 (Strict)", base: Canfield, params: { stockDraws: "1", restocksAllowed: "0" } },

    // 75-79. Special Freecell Variants
    { id: "freecell_d1", name: "Freecell (1 Cell)", base: Freecell, params: { cellsCount: "1" } },
    { id: "freecell_d2", name: "Freecell (2 Cells)", base: Freecell, params: { cellsCount: "2" } },
    { id: "freecell_d3", name: "Freecell (3 Cells)", base: Freecell, params: { cellsCount: "3" } },
    { id: "double_freecell", name: "Double Freecell", base: Freecell, params: { decksCount: "2" } },
    { id: "triple_freecell", name: "Triple Freecell", base: Freecell, params: { decksCount: "3" } },

    // 80-81. Whitehead & Alaska
    { id: "whitehead", name: "Whitehead", base: Klondike, params: { buildSameColor: "true" } },
    { id: "alaska", name: "Alaska", base: Yukon, params: { buildInSuit: "true" } },

    // 82-93. Forty Thieves Historical Variants
    { id: "josephine", name: "Josephine", base: FortyThieves, params: { moveSequences: "true" } },
    { id: "lucas", name: "Lucas", base: FortyThieves, params: { dealAcesFirst: "true" } },
    { id: "maria", name: "Maria", base: FortyThieves, params: { columnsCount: "9" } },
    { id: "limited", name: "Limited", base: FortyThieves, params: { columnsCount: "12", cardsPerColumn: "3" } },
    { id: "streets", name: "Streets", base: FortyThieves, params: { buildAlternatingColor: "true" } },
    { id: "rank_and_file", name: "Rank and File", base: FortyThieves, params: { cardsFaceDown: "true" } },
    { id: "number_ten", name: "Number Ten", base: FortyThieves, params: { columnsCount: "10", cardsFaceUp: "2" } },
    { id: "red_and_black", name: "Red and Black", base: FortyThieves, params: { buildAlternatingColor: "true" } },
    { id: "emperor", name: "Emperor", base: FortyThieves, params: { buildAlternatingColor: "true", cardsFaceDown: "true" } },
    { id: "ali_baba", name: "Ali Baba", base: FortyThieves, params: { columnsCount: "10", cardsPerColumn: "4" } },
    { id: "blockade", name: "Blockade", base: FortyThieves, params: { blockadeMode: "true" } },
    { id: "busy_aces", name: "Busy Aces", base: FortyThieves, params: { columnsCount: "12", cardsPerColumn: "1" } },

    // 94-96. Other Classic Solitaires
    { id: "forecell", name: "Forecell", base: Freecell, params: { emptyTableauKingsOnly: "true" } },
    { id: "tuxedo", name: "Tuxedo", base: SeahavenTowers, params: { tuxedoRules: "true" } },
    { id: "seven", name: "Seven Freecell", base: Freecell, params: { columnsCount: "7" } },
];

export const variants: IGameInfo[] = definitions.map((def) => {
    return {
        gameId: def.id,
        gameName: def.name,
        gamePresenterFactory: new VariantPresenterFactory(def.base.gamePresenterFactory, def.params),
    };
});
