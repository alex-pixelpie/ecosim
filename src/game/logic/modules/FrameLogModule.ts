import {Component} from "../../core/ECS.ts";
import {GameLogic, GameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";

export enum FrameLogType {
    Attack = 'Attack',
    TakeDamage = 'TakeDamage',
    TakeCriticalDamage = 'TakeCriticalDamage',
    MoveTargetReached = 'MoveTargetReached',
    CollectCoins = 'CollectCoins',
}

export interface FrameLogEntry {
    type: string;
    value: number;
    timestamp: number;
}

export class FrameLog extends Component {
    logs: FrameLogEntry[] = [];
}

export class FrameLogSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([FrameLog]);

    protected init(): void {
        this.componentsRequired = new Set([FrameLog]);
    }
    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const frameLog = this.game.ecs.getComponent<FrameLog>(entity, FrameLog);
            frameLog.logs = [];
        });
    }
}

export class FrameLogModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const frameLogSystem = new FrameLogSystem(game);
        game.ecs.addSystem(frameLogSystem);
    }
}