import {GameLogic} from "../../GameLogic.ts";

export interface Action {
    preconditions: Record<string, boolean>;
    effects: Record<string, boolean>;
    cost: number;
    isValid(state: Record<string, boolean>): boolean;
    successState(state: Record<string, boolean>): Record<string, boolean>;
    hasCompleted(entity: number, game: GameLogic): boolean;
}
