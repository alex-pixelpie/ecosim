import {IUtilityBehavior, State} from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";

export class IdleBehavior implements IUtilityBehavior {
    name: string = "Idle";
    
    public updateState(game: GameLogic, entity: number, state: State): void {
        // Do nothing
    }

    public getUtility(game: GameLogic, entity: number, state: State): number {
        return 0;
    }

    public execute(game: GameLogic, entity: number, state: State): void {
        // Do nothing
    }
}