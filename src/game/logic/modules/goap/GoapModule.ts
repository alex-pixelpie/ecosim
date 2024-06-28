import {GameLogic, GameSystem} from "../../GameLogic.ts";
import { GameLogicModule } from "../../GameLogicModule.ts";
import {Component} from "../../../core/ECS.ts";
import {GoapStateComponent} from "./GoapStateComponent.ts";
import {Action} from "./actions/Action.ts";

class Planner {
    static maxLoops = 100;

    plan(actions: Action[], goal: Goal, initialState: Record<string, boolean>): Action[] {
        let openSet: Action[] = [];
        let currentState = { ...initialState };

        let loops = 0;
        
        while (!this.goalAchieved(currentState, goal.desiredState) && loops++ < Planner.maxLoops) {
            let validActions = actions.filter(action => action.isValid(currentState));
            if (validActions.length === 0) {
                return openSet;
            }

            let bestAction = validActions.sort((a, b) => a.cost - b.cost)[0];
            openSet.push(bestAction);
            currentState = bestAction.completionState(currentState);
        }
        
        if (loops >= Planner.maxLoops) {
            console.error("GOAP: max loops reached");
        }

        return openSet;
    }

    goalAchieved(currentState: Record<string, boolean>, desiredState: Record<string, boolean>): boolean {
        for (let key in desiredState) {
            if (currentState[key] != desiredState[key]) {
                return false;
            }
        }
        return true;
    }
}

export interface Goal {
    desiredState: Record<string, boolean>;
    priority: number;
    updatePriority(state: Record<string, boolean>): void;
    name: string;
}

export class GoalsComponent implements Component {
    goals: Goal[];
    goal: Goal;
    
    constructor(goals: Goal[]) {
        this.goals = goals;
    }

    updatePriorities(state: Record<string, boolean>): void {
        this.goals.forEach(goal => goal.updatePriority(state));
    }
}

export class ActionComponent implements Component {
    plan: Action[] = [];
    currentAction: Action | null = null;
}

export class AvailableActionsComponent implements Component {
    actions: Action[];

    constructor(actions: Action[]) {
        this.actions = actions;
    }
}

class ActionSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([ActionComponent, GoapStateComponent, GoalsComponent]);
    private planner: Planner;

    protected init(): void {
        this.componentsRequired = new Set([ActionComponent, GoapStateComponent, GoalsComponent]);
        this.planner = new Planner();
    }
    
    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const actionComponent = this.game.ecs.getComponent(entity, ActionComponent);
            const stateComponent = this.game.ecs.getComponent(entity, GoapStateComponent);
            const goalsComponent = this.game.ecs.getComponent(entity, GoalsComponent);
            
            goalsComponent.updatePriorities(stateComponent.state);

            const goals = goalsComponent.goals.sort((a, b) => b.priority - a.priority);
            if (goals[0] !== goalsComponent.goal) {
                this.createPlan(entity);
            }
            
            if (actionComponent.currentAction && !actionComponent.currentAction.hasCompleted(entity, this.game)) {
                return;
            }
            
            // if (actionComponent.currentAction) {
            //     stateComponent.state = actionComponent.currentAction.successState(stateComponent.state);
            // }
            
            if (actionComponent.plan.length === 0) {
                this.createPlan(entity);
            }

            actionComponent.currentAction = actionComponent.plan.shift() || null;
        });
    }

    private createPlan(entity: number) {
        this.planner = this.planner || new Planner();

        const actionComponent = this.game.ecs.getComponent<ActionComponent>(entity, ActionComponent);
        const stateComponent = this.game.ecs.getComponent<GoapStateComponent>(entity, GoapStateComponent);
        const goalsComponent = this.game.ecs.getComponent<GoalsComponent>(entity, GoalsComponent);
        const availableActionsComponent = this.game.ecs.getComponent<AvailableActionsComponent>(entity, AvailableActionsComponent);

        const goals = goalsComponent.goals.sort((a, b) => b.priority - a.priority);
        goalsComponent.goal = goals[0];

        actionComponent.plan = this.planner.plan(availableActionsComponent.actions, goalsComponent.goal, stateComponent.state);
        actionComponent.currentAction = null;
    }
}

export class GoapModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const actionSystem = new ActionSystem(game);
        game.ecs.addSystem(actionSystem);
    }
}
