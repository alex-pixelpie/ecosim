import {IUtilityBehavior, State} from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";

export class IdleBehavior implements IUtilityBehavior {
    name: string = "Idle";
    group: number;

    public updateState(game: GameLogic, entity: number, state: State): void {
        
    }

    public getUtility(game: GameLogic, entity: number, state: State): number {
        return 0;
    }

    public execute(game: GameLogic, entity: number, state: State): void {
        // Do nothing
    }
}