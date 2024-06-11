import {GameLogic, GameLogicModule, GameSystem} from "../GameLogic.ts";
import {RangeFromTarget, Targeted, TargetSelection} from "./Targeting.ts";
import {MathUtils} from "../../utils/Math.ts";
import {Steering} from "./SteeringModule.ts";
import {PhysicsModule} from "./PhysicsModule.ts";
import Position = PhysicsModule.Position;
import {GOAP} from "./goap/GoapModule.ts";
import ActionComponent = GOAP.ActionComponent;
import {Weapon} from "./weapons/Weapons.ts";
import {MoveAction} from "./goap/actions/MoveAction.ts";
import {AttackAction} from "./goap/actions/AttackAction.ts";
import {EscapeOverwhelmAction} from "./goap/actions/EscapeOverwhelmAction.ts";
import {GoapState, MobGoapStateComponent} from "./goap/MobGoapStateComponent.ts";
import {OverwhelmComponent} from "./OverwhelmModule.ts";

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
        const position = this.game.ecs.getComponent<Position>(entity, Position);
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
            
            moveDesires.desires.push(dir);
        });
    }
        
    private processMoveAction(entity: number): void {
        const moveDesires = this.game.ecs.getComponent<Steering>(entity, Steering);
        const rangeFromTarget = this.game.ecs.getComponent<RangeFromTarget>(entity, RangeFromTarget);
        const position = this.game.ecs.getComponent<Position>(entity, Position);
        const targetSelection = this.game.ecs.getComponent<TargetSelection>(entity, TargetSelection);

        if (!moveDesires || !rangeFromTarget || !position || !targetSelection?.target) {
            return;
        }

        const tooClose = rangeFromTarget.tooClose(position, targetSelection);
        const tooFar = rangeFromTarget.tooFar(position, targetSelection);

        if (tooClose) {
            const dir = MathUtils.multiply(MathUtils.normalize({
                x: position.x - targetSelection.x,
                y: position.y - targetSelection.y
            }), this.intensity);
            moveDesires.desires.push(dir);
        } else if (tooFar) {
            const dir = MathUtils.multiply(MathUtils.normalize({
                x: targetSelection.x - position.x,
                y: targetSelection.y - position.y
            }), this.intensity);
            moveDesires.desires.push(dir);
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
    public componentsRequired: Set<Function> = new Set([MobGoapStateComponent]);

    protected init(): void {
        this.componentsRequired = new Set([MobGoapStateComponent]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const state = this.game.ecs.getComponent(entity, MobGoapStateComponent);
            
            this.updateInRangeState(entity, state);
            this.updateOverwhelmState(entity, state);
            this.updateTargetingState(entity, state);
        });
    }

    private updateInRangeState(entity: number, state: MobGoapStateComponent) {
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

        state.state[GoapState.inRange] = rangeComponent.inRange(positionComponent, targetSelectionComponent);
    }

    private updateOverwhelmState(entity: number, state: MobGoapStateComponent) {
        const overwhelm = this.game.ecs.getComponent(entity, OverwhelmComponent);
        state.state[GoapState.overwhelmed] = overwhelm?.overwhelmed || false;
    }

    private updateTargetingState(entity: number, state: MobGoapStateComponent) {
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