import {GameLogic, GameLogicModule, GameSystem} from "../../GameLogic.ts";
import {Component} from "../../../core/ECS.ts";
import {TargetSelectionSystem} from "./Targeting.ts";
import {MobGoapStateComponent} from "./MobGoapStateComponent.ts";
import {Action} from "./Action.ts";
import {MobGoapState} from "./MobGoapState.ts";
import {GlideLocomotionSystem} from "./Locomotion.ts";
import {AttackSystem, DeathSystem} from "./Attack.ts";

export namespace GOAP {
    class Planner {
        plan(actions: Action[], goal: Goal, initialState: Record<string, boolean>): Action[] {
            let openSet: Action[] = [];
            let currentState = { ...initialState };

            while (!this.goalAchieved(currentState, goal.desiredState)) {
                let validActions = actions.filter(action => action.isValid(currentState));
                if (validActions.length === 0) {
                    return openSet;
                }

                let bestAction = validActions.sort((a, b) => a.cost - b.cost)[0];
                openSet.push(bestAction);
                currentState = bestAction.successState(currentState);
            }

            return openSet;
        }

        goalAchieved(currentState: Record<string, boolean>, desiredState: Record<string, boolean>): boolean {
            for (let key in desiredState) {
                if (currentState[key] !== desiredState[key]) {
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
    }

    export class KillEnemiesGoal implements Goal {
        desiredState = { [MobGoapState.hasTarget]: false, [MobGoapState.inRange]: true };
        priority = 1;

        updatePriority(_: Record<string, boolean>): void {
            this.priority = 1000;
        }
    }

    export class GoalsComponent implements Component {
        goals: Goal[];

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
        public componentsRequired: Set<Function> = new Set([ActionComponent, MobGoapStateComponent, GoalsComponent]);
        private planner: Planner;

        protected init(): void {
            this.componentsRequired = new Set([ActionComponent, MobGoapStateComponent, GoalsComponent]);
            this.planner = new Planner();
        }
        
        public update(entities: Set<number>, _: number): void {
            entities.forEach(entity => {
                const actionComponent = this.game.ecs.getComponent<ActionComponent>(entity, ActionComponent);
                const stateComponent = this.game.ecs.getComponent<MobGoapStateComponent>(entity, MobGoapStateComponent);
                const goalsComponent = this.game.ecs.getComponent<GoalsComponent>(entity, GoalsComponent);
                
                goalsComponent.updatePriorities(stateComponent.state);

                if (actionComponent.currentAction && !actionComponent.currentAction.hasCompleted(entity, this.game)) {
                    return;
                }
                
                if (actionComponent.currentAction) {
                    stateComponent.state = actionComponent.currentAction.successState(stateComponent.state);
                }
                
                if (actionComponent.plan.length === 0) {
                    this.createPlan(entity);
                }

                actionComponent.currentAction = actionComponent.plan.shift() || null;
            });
        }

        private createPlan(entity: number) {
            this.planner = this.planner || new Planner();

            const actionComponent = this.game.ecs.getComponent<ActionComponent>(entity, ActionComponent);
            const stateComponent = this.game.ecs.getComponent<MobGoapStateComponent>(entity, MobGoapStateComponent);
            const goalsComponent = this.game.ecs.getComponent<GoalsComponent>(entity, GoalsComponent);
            const availableActionsComponent = this.game.ecs.getComponent<AvailableActionsComponent>(entity, AvailableActionsComponent);

            let goals = goalsComponent.goals.sort((a, b) => a.priority - b.priority);
            let goal = goals[0];

            actionComponent.plan = this.planner.plan(availableActionsComponent.actions, goal, stateComponent.state);
        }
    }
    
    const interval:number = 0.3;
    
    export class GoapModule extends GameLogicModule {
        public init(game: GameLogic): void {
            const actionSystem = new ActionSystem(game);
            game.ecs.addSystem(actionSystem);
            
            const targetingSystem = new TargetSelectionSystem(game, interval);
            game.ecs.addSystem(targetingSystem);
            
            const glideLocomotionSystem = new GlideLocomotionSystem(game);
            game.ecs.addSystem(glideLocomotionSystem);
            
            const attackSystem = new AttackSystem(game);
            game.ecs.addSystem(attackSystem);
            
            const deathSystem = new DeathSystem(game);
            game.ecs.addSystem(deathSystem);
        }
    }
}