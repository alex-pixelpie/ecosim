import {Component} from "../../core/ECS.ts";
import {GameLogic, GameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Pos} from "../../utils/Math.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {Configs} from "../../configs/Configs.ts";

export class Steering extends Component {
    impulses: Pos[] = [];
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

export class WallsAvoider extends Component {
    constructor(public avoidanceIntensity: number = 1, public mapEdgeProximityThreshold: number = 500) {
        super();
    }
}

class WallsAvoidanceSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([WallsAvoider]);

    protected init(): void {
        this.componentsRequired = new Set([WallsAvoider]);
    }
    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const avoider = this.game.ecs.getComponent(entity, WallsAvoider);
            const steering = this.game.ecs.getComponent(entity, Steering);
            const position = this.game.ecs.getComponent(entity, Position);
            if (!avoider || !steering || !position) {
                return;
            }
            WallsAvoidanceSystem.avoidWalls(steering, position, avoider);
        });
    }

    private static avoidWalls(steering: Steering, position: Position, avoider:WallsAvoider): void {
        // Add wall avoidance
        const avoidanceIntensity = avoider.avoidanceIntensity;
        const wallProximityThreshold = avoider.mapEdgeProximityThreshold;

        const size = Configs.mapConfig.pixelsSize;

        const worldWidth = size;
        const worldHeight = size;

        // Calculate nearest point on each wall
        const nearestPointToLeftWall = { x: 0, y: position.y };
        const nearestPointToRightWall = { x: worldWidth, y: position.y };
        const nearestPointToTopWall = { x: position.x, y: 0 };
        const nearestPointToBottomWall = { x: position.x, y: worldHeight };

        // Calculate distances to the nearest point on each wall
        const distanceToLeftWall = Math.hypot(position.x - nearestPointToLeftWall.x, position.y - nearestPointToLeftWall.y);
        const distanceToRightWall = Math.hypot(position.x - nearestPointToRightWall.x, position.y - nearestPointToRightWall.y);
        const distanceToTopWall = Math.hypot(position.x - nearestPointToTopWall.x, position.y - nearestPointToTopWall.y);
        const distanceToBottomWall = Math.hypot(position.x - nearestPointToBottomWall.x, position.y - nearestPointToBottomWall.y);

        // Calculate avoidance impulses based on proximity to nearest point on walls
        if (distanceToLeftWall < wallProximityThreshold) {
            const intensity = avoidanceIntensity * (1 - distanceToLeftWall / wallProximityThreshold);
            const impulse = { x: intensity, y: 0 };
            steering.impulses.push(impulse);
        }
        if (distanceToRightWall < wallProximityThreshold) {
            const intensity = avoidanceIntensity * (1 - distanceToRightWall / wallProximityThreshold);
            const impulse = { x: -intensity, y: 0 };
            steering.impulses.push(impulse);
        }
        if (distanceToTopWall < wallProximityThreshold) {
            const intensity = avoidanceIntensity * (1 - distanceToTopWall / wallProximityThreshold);
            const impulse = { x: 0, y: intensity };
            steering.impulses.push(impulse);
        }
        if (distanceToBottomWall < wallProximityThreshold) {
            const intensity = avoidanceIntensity * (1 - distanceToBottomWall / wallProximityThreshold);
            const impulse = { x: 0, y: -intensity };
            steering.impulses.push(impulse);
        }
    };
}

export class SteeringModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const moveDesiresResetSystem = new SteeringResetSystem(game);
        game.ecs.addSystem(moveDesiresResetSystem);
        
        const wallsAvoidanceSystem = new WallsAvoidanceSystem(game);
        game.ecs.addSystem(wallsAvoidanceSystem);
    }
}
