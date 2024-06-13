import {GameLogic, GameLogicModule, GameSystem} from "../GameLogic.ts";
import {MathUtils} from "../../utils/Math.ts";
import {Steering} from "./SteeringModule.ts";
import {Weapon} from "./weapons/Weapons.ts";
import {MoveAction} from "./goap/actions/MoveAction.ts";
import {AttackAction} from "./goap/actions/AttackAction.ts";
import {EscapeOverwhelmAction} from "./goap/actions/EscapeOverwhelmAction.ts";
import {GoapState, GoapStateComponent} from "./goap/GoapStateComponent.ts";
import {OverwhelmComponent} from "./OverwhelmModule.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {ActionComponent} from "./goap/GoapModule.ts";
import {RangeFromTarget, Targeted, TargetSelection} from "./TargetingModule.ts";

class GoapToSteeringDesiresSystem extends GameSystem {
    public intensity: number = 1;

    public componentsRequired: Set<Function> = new Set([Steering, ActionComponent]);

    protected init(): void {
        this.componentsRequired = new Set([Steering, ActionComponent]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const action = this.game.ecs.getComponent(entity, ActionComponent);
            switch (action?.currentAction?.type) {
                case MoveAction.name:
                    this.processMoveAction(entity);
                    break;
                case AttackAction.name:
                    break;
                case EscapeOverwhelmAction.name:
                    this.processEscapeOverwhelmAction(entity);
                    break;
            }
        });
    }
    
    private processEscapeOverwhelmAction(entity: number): void {
        const moveDesires = this.game.ecs.getComponent<Steering>(entity, Steering);
        const position = this.game.ecs.getComponent(entity, Position);
        const targeted = this.game.ecs.getComponent(entity, Targeted);
        
        if (!moveDesires || !position || !targeted) {
            return;
        }
        
        targeted.targetedBy.forEach(enemy => {
            const enemyPosition = this.game.ecs.getComponent(enemy, Position);
            if (!enemyPosition) {
                return;
            }
            
            const dir = MathUtils.multiply(MathUtils.normalize({
                x: position.x - enemyPosition.x,
                y: position.y - enemyPosition.y
            }), this.intensity);
            
            moveDesires.impulses.push(dir);
        });
    }

    private processMoveAction(entity: number): void {
        const steering = this.game.ecs.getComponent(entity, Steering);
        const rangeFromTarget = this.game.ecs.getComponent(entity, RangeFromTarget);
        const position = this.game.ecs.getComponent(entity, Position);
        const targetSelection = this.game.ecs.getComponent(entity, TargetSelection);

        if (!steering || !rangeFromTarget || !position || !targetSelection?.target) {
            return;
        }

        const tooClose = rangeFromTarget.tooClose(position, targetSelection, targetSelection.targetSize);
        const tooFar = rangeFromTarget.tooFar(position, targetSelection, targetSelection.targetSize);

        if (tooClose) {
            const dir = MathUtils.multiply(MathUtils.normalize({
                x: position.x - targetSelection.x,
                y: position.y - targetSelection.y
            }), this.intensity);
            steering.impulses.push(dir);
        } else if (tooFar) {
            const dir = MathUtils.multiply(MathUtils.normalize({
                x: targetSelection.x - position.x,
                y: targetSelection.y - position.y
            }), this.intensity);
            steering.impulses.push(dir);
        }
        
        this.avoidWalls(steering, position);
    }
    
    private avoidWalls(steering: Steering, position: Position) {
        // Add wall avoidance
        const avoidanceIntensity = 1; // Adjust this value based on desired avoidance strength
        const wallProximityThreshold = 500; // Adjust this value based on how close is "too close" to a wall

        const size = this.game.config.tilesInMapSide * 32; // TODO - get value from config

        const worldWidth = size - 100; // Replace with actual world width
        const worldHeight = size - 100; // Replace with actual world height

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
    }
}

class GoapToWeaponUseSystem extends GameSystem {
    public intensity: number = 1;

    public componentsRequired: Set<Function> = new Set([ActionComponent, Weapon]);

    protected init(): void {
        this.componentsRequired = new Set([ActionComponent, Weapon]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const weapon = this.game.ecs.getComponent<Weapon>(entity, Weapon);
            const action = this.game.ecs.getComponent(entity, ActionComponent);
            weapon.isInUse = action?.currentAction?.type == AttackAction.name;
        });
    }
}

class GoapStateUpdateSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([GoapStateComponent]);

    protected init(): void {
        this.componentsRequired = new Set([GoapStateComponent]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const state = this.game.ecs.getComponent(entity, GoapStateComponent);
            
            this.updateInRangeState(entity, state);
            this.updateOverwhelmState(entity, state);
            this.updateTargetingState(entity, state);
        });
    }

    private updateInRangeState(entity: number, state: GoapStateComponent) {
        const game = this.game;
        state.state[GoapState.inRange] = false;

        const targetSelectionComponent = game.ecs.getComponent(entity, TargetSelection);

        if (!targetSelectionComponent || isNaN(targetSelectionComponent.target as number)) {
            return false;
        }

        const positionComponent = game.ecs.getComponent(entity, Position);

        if (!positionComponent) {
            return false;
        }

        const rangeComponent = game.ecs.getComponent(entity, RangeFromTarget);

        if (!rangeComponent) {
            return false;
        }

        state.state[GoapState.inRange] = rangeComponent.inRange(positionComponent, targetSelectionComponent, targetSelectionComponent.targetSize);
    }

    private updateOverwhelmState(entity: number, state: GoapStateComponent) {
        const overwhelm = this.game.ecs.getComponent(entity, OverwhelmComponent);
        state.state[GoapState.overwhelmed] = overwhelm?.overwhelmed || false;
    }

    private updateTargetingState(entity: number, state: GoapStateComponent) {
        const targetSelection = this.game.ecs.getComponent<TargetSelection>(entity, TargetSelection);
        state.state[GoapState.hasTarget] = !!(targetSelection?.target);
    }
}

export class GoapConnectorModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const goapToSteeringDesiresSystem = new GoapToSteeringDesiresSystem(game);
        game.ecs.addSystem(goapToSteeringDesiresSystem);
        
        const weaponUseSystem = new GoapToWeaponUseSystem(game);
        game.ecs.addSystem(weaponUseSystem);
        
        const goapStateUpdateSystem = new GoapStateUpdateSystem(game);
        game.ecs.addSystem(goapStateUpdateSystem);
    }
}