import {Action} from "./Action.ts";
import {MobGoapState} from "./MobGoapState.ts";
import {Component} from "../../../core/ECS.ts";
import {GameLogic, GameSystem} from "../../GameLogic.ts";
import {MobGoapStateComponent} from "./MobGoapStateComponent.ts";
import {TargetSelection} from "./Targeting.ts";
import {PhysicsModule} from "../PhysicsModule.ts";
import Position = PhysicsModule.Position;
import {PhaserPhysicsModule} from "../PhaserPhysicsModule.ts";
import PhysicsBody = PhaserPhysicsModule.PhysicsBody;
import {MathUtils} from "../../../utils/Math.ts";

interface Pos {
    x:number;
    y:number;
}

export class MoveAction implements Action {
    preconditions = {[MobGoapState.inRange]: false  };
    effects = { [MobGoapState.inRange]: true };
    cost: number = 10;

    isValid(state: Record<string, boolean>): boolean {
        return !state[MobGoapState.inRange];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const targetSelectionComponent = game.ecs.getComponent<TargetSelection>(entity, TargetSelection);
        
        if (!targetSelectionComponent || isNaN(targetSelectionComponent.target as number)) {
            return false;
        }
        
        const positionComponent = game.ecs.getComponent<Position>(entity, Position);
        
        if (!positionComponent) {
            return false;
        }
        
        const rangeComponent = game.ecs.getComponent<RangeFromTarget>(entity, RangeFromTarget);
        
        if (!rangeComponent) {
            return false;
        }
        
        return this.isWithinRange(positionComponent, targetSelectionComponent, rangeComponent.distance);
    }

    private isWithinRange(currentPosition: Pos, targetPosition: Pos, range: number): boolean {
        const distance = MathUtils.distance(currentPosition, targetPosition);
        return distance <= range;
    }
}

export class GlideLocomotion extends Component {
    constructor(public speed: number = 1) {
        super();
    }
}

export class RangeFromTarget extends Component {
    constructor(public distance: number = 1) {
        super();
    }
}

export class GlideLocomotionSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([MobGoapStateComponent, GlideLocomotion]);

    protected init(): void {
        this.componentsRequired = new Set([MobGoapStateComponent, GlideLocomotion]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const stateComponent = this.game.ecs.getComponent<MobGoapStateComponent>(entity, MobGoapStateComponent);
            const body = this.game.ecs.getComponent<PhysicsBody>(entity, PhysicsBody);

            if (!body) {
                return;
            }

            if (stateComponent.state[MobGoapState.inRange] || !stateComponent.state[MobGoapState.hasTarget]) {
                body.body.setVelocity(0, 0);
                return;
            }
            
            const walk = this.game.ecs.getComponent<GlideLocomotion>(entity, GlideLocomotion);

            if (!walk) {
                body.body.setVelocity(0, 0);
                return;
            }
            
            const targetSelection = this.game.ecs.getComponent<TargetSelection>(entity, TargetSelection);
            
            if (!targetSelection) {
                body.body.setVelocity(0, 0);
                return;
            }

            const direction = this.getNormalizedDirection(body.body.position, targetSelection);
            body.body.setVelocity(direction.x * walk.speed, direction.y * walk.speed);
        });
    }

    getNormalizedDirection(from: Pos, to: Pos): Pos {
        // Calculate the direction vector
        const direction = {
            x: to.x - from.x,
            y: to.y - from.y,
        };

        // Calculate the magnitude (length) of the direction vector
        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

        // Handle the case where the magnitude is zero to avoid division by zero
        if (magnitude === 0) {
            return { x: 0, y: 0 };
        }

        // Normalize the direction vector
        return {
            x: direction.x / magnitude,
            y: direction.y / magnitude,
        };
    }
}