import {GameLogic} from "../../../GameLogic.ts";
import {GoapStateComponent, GoapStateKey} from "../GoapStateComponent.ts";

export abstract class Action {
    preconditions: Record<string, boolean>;
    effects: Record<string, boolean>;
    cost: number;
    type: string;
    name: string;
    
    isValid(state: Record<string, boolean>): boolean {
        const keys = Object.keys(this.preconditions);
        
        const result = keys.some(key => {
            const stateValue = state[key];
            const precondition = this.preconditions[key as keyof typeof this.preconditions];
            return stateValue != precondition;
        });
        
        return !result;
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const state = game.ecs.getComponent(entity, GoapStateComponent);
        const keys = Object.keys(this.effects);
        const result = keys.every(key => {
            const stateValue = state.state[key as GoapStateKey];
            const resultValue = this.effects[key as GoapStateKey];
            return resultValue == stateValue;
        });
        return result;
    }
}
