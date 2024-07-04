import { IUtilityBehavior, State } from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";

export class ExploreBehavior implements IUtilityBehavior {
    name: string = "Exploring";
    group: number;

    getUtility(game: GameLogic, entity: number, state: State): number {
        if (state.seeEnemies || state.seeLoot) {
            return 0;
        }
        
        return state.exploring ? 2 : 1;
    }
    
    execute(game: GameLogic, entity: number, state: State): void {
        state.exploring = true;
        
        // TODO - implement exploration
    }

    updateState(game: GameLogic, entity: number, state: State): void {
        state.exploring = false;
    }
}
