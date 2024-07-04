import {GameLogic, GameSystem} from "../../GameLogic.ts";
import {GameLogicModule} from "../../GameLogicModule.ts";
import {Component} from "../../../core/ECS.ts";
import {GroupType} from "../MobsModule.ts";

export const LootState = {
    seeLoot: "seeLoot"
} as const;

export const PatrolState = {
    patrolling: "patrolling"
} as const;

export const AttackState = {
    seeEnemies: "seeEnemies",
    attacking: "attacking"
} as const;

export const ExploreState = {
    exploring: "exploring"
} as const;

export const StateConst = {...LootState, ...PatrolState, ...AttackState, ...ExploreState} as const;

export type StateKey = keyof typeof StateConst;

export type State = Record<StateKey, boolean>;

export const defaultState: Record<StateKey, boolean> = Object.keys(StateConst).reduce((acc, key) => {
    acc[key as StateKey] = false;
    return acc;
}, {} as Record<StateKey, boolean>);

export interface IUtilityBehavior {
    name:string;
    group: GroupType;
    
    updateState(game: GameLogic, entity: number, state:State): void;
    getUtility(game: GameLogic, entity: number, state:State): number;
    execute(game: GameLogic, entity: number, state:State): void;
    stop?(game: GameLogic, entity: number, state:State): void;
}

export class UtilityBehavior extends Component {
    public behaviors: IUtilityBehavior[] = [];
    public state: State = {...defaultState};
    public currentBehavior: IUtilityBehavior | null = null;
    public group: GroupType;
    
    public constructor(behaviors: IUtilityBehavior[], group: GroupType) {
        super();
        this.behaviors = behaviors;
        this.group = group;
    }
}

class UtilityBehaviorSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([UtilityBehavior]);

    protected init(): void {
        this.componentsRequired = new Set([UtilityBehavior]);
    }
    
    public update(entities: Set<number>, delta: number): void {
        entities.forEach(entity => {
            const utilityBehavior = this.game.ecs.getComponent(entity, UtilityBehavior);
            if (!utilityBehavior) {
                return;
            }

            utilityBehavior.behaviors.forEach(behavior => {
                behavior.group = utilityBehavior.group;
                behavior.updateState(this.game, entity, utilityBehavior.state);
            });

            const bestBehavior = this.getBestBehavior(utilityBehavior, entity);
            
            if (utilityBehavior.currentBehavior != bestBehavior && utilityBehavior.currentBehavior) {
                utilityBehavior.currentBehavior.stop?.(this.game, entity, utilityBehavior.state);
            }
            
            utilityBehavior.currentBehavior = bestBehavior;
            
            if (bestBehavior) {
                bestBehavior.execute(this.game, entity, utilityBehavior.state);
            }
        });
    }

    private getBestBehavior(utilityBehavior: UtilityBehavior, entity: number) : IUtilityBehavior | null {
        let bestBehavior = utilityBehavior.currentBehavior;
        let bestUtility = -Infinity;

        utilityBehavior.behaviors.forEach(behavior => {
            const utility = behavior.getUtility(this.game, entity, utilityBehavior.state);
            if (utility > bestUtility) {
                bestUtility = utility;
                bestBehavior = behavior;
            }
        });

        return bestBehavior;
    }
}

export class UtilityBehaviorModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const utilityBehaviorSystem = new UtilityBehaviorSystem(game);
        game.ecs.addSystem(utilityBehaviorSystem);
    }
}