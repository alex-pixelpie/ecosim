import {Component} from "../../core/ECS.ts";
import {MathUtils, Pos} from "../../utils/Math.ts";
import {GameLogic, GameLogicModule, TimedGameSystem} from "../GameLogic.ts";
import {PhysicsModule} from "./PhysicsModule.ts";
import Position = PhysicsModule.Position;

export class TargetSelection implements Component {
    target: number | null = null;
    x: number = 0;
    y: number = 0;
}

export class RangeFromTarget extends Component {
    constructor(public maxDistance: number = 1, public minDistance: number = 0) {
        super();
    }

    inRange(currentPosition: Pos, targetPosition: Pos): boolean {
        const distance = MathUtils.distance(currentPosition, targetPosition);
        return distance <= this.maxDistance && distance >= this.minDistance;
    }
    
    tooClose(currentPosition: Pos, targetPosition: Pos): boolean {
        const distance = MathUtils.distance(currentPosition, targetPosition);
        return distance < this.minDistance;
    }
    
    tooFar(currentPosition: Pos, targetPosition: Pos): boolean {
        const distance = MathUtils.distance(currentPosition, targetPosition);
        return distance > this.maxDistance;
    }
}

export class TargetSelectionSystem extends TimedGameSystem {
    public componentsRequired: Set<Function> = new Set([TargetSelection]);

    protected init(): void {
        this.componentsRequired = new Set([TargetSelection]);
    }

    public updateTimed(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const targetSelection = this.game.ecs.getComponent<TargetSelection>(entity, TargetSelection);

            // If we have a target, and it's no longer valid, clear it
            if (targetSelection.target && !this.game.mobs.has(targetSelection.target)) {
                targetSelection.target = null;
            }

            // If we don't have a target, select one
            if (!targetSelection.target) {
                targetSelection.target = this.selectTarget(entity, entities);
            }
            
            // If we have a target, track its position
            if (targetSelection.target) {
                const targetPosition = this.game.ecs.getComponent<Position>(targetSelection.target, Position);

                if (targetPosition) {
                    targetSelection.x = targetPosition.x;
                    targetSelection.y = targetPosition.y;
                    return;
                }
            }
        });
    }

    private selectTarget(entity: number, entities: Set<number>): number | null {
        const position = this.game.ecs.getComponent<Position>(entity, Position);
        if (!position) {
            return null;
        }

        const potentialTargets = [...entities].filter(e => e !== entity && e !== null);

        if (potentialTargets.length === 0) {
            return null;
        }

        const targetsByDistance = potentialTargets.map(e => {
            const targetPosition = this.game.ecs.getComponent<Position>(e, Position);
            if (!targetPosition) {
                return null;
            }

            return {
                entity: e,
                distance: MathUtils.distance(position, targetPosition)
            };
        }).filter(v => v).sort((a, b) => (a?.distance ?? 0) - (b?.distance ?? 0));

        if (targetsByDistance.length === 0) {
            return null;
        }

        return targetsByDistance[0]!.entity;
    }
}

const updateInterval = 1;

export class TargetingModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const targetSelectionSystem = new TargetSelectionSystem(game, updateInterval);
        game.ecs.addSystem(targetSelectionSystem);    
    }
}