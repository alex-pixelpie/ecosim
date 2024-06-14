import {Component} from "../../core/ECS.ts";
import {GameLogic, GameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Pos} from "../../utils/Math.ts";

export class Steering extends Component {
    impulses: Pos[] = [];
    mapEdgeProximityThreshold = 500;
}

export class SteeringResetSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Steering]);

    protected init(): void {
        this.componentsRequired = new Set([Steering]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const steering = this.game.ecs.getComponent<Steering>(entity, Steering);
            if (!steering) {
                return;
            }

            steering.impulses = [];
        });
    }
}

export class SteeringModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const moveDesiresResetSystem = new SteeringResetSystem(game);
        game.ecs.addSystem(moveDesiresResetSystem);
    }
}
