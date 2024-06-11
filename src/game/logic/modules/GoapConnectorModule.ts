import {GameLogic, GameLogicModule, GameSystem} from "../GameLogic.ts";
import {RangeFromTarget, TargetSelection} from "./Targeting.ts";
import {MoveAction} from "./goap/MoveAction.ts";
import {MathUtils} from "../../utils/Math.ts";
import {Steering} from "./SteeringModule.ts";
import {PhysicsModule} from "./PhysicsModule.ts";
import Position = PhysicsModule.Position;
import {GOAP} from "./goap/GoapModule.ts";
import ActionComponent = GOAP.ActionComponent;
import {Weapon} from "./weapons/Weapons.ts";
import {AttackAction} from "./goap/AttackAction.ts";

class GoapToSteeringDesiresSystem extends GameSystem {
    public intensity: number = 1;

    public componentsRequired: Set<Function> = new Set([Steering, ActionComponent]);

    protected init(): void {
        this.componentsRequired = new Set([Steering, ActionComponent]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const action = this.game.ecs.getComponent(entity, ActionComponent);
            if (action?.currentAction?.type != MoveAction.name) {
                return;
            }

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
                const dir = MathUtils.multiply(MathUtils.normalize({ x: position.x - targetSelection.x, y: position.y - targetSelection.y }), this.intensity);
                moveDesires.desires.push(dir);
            } else if (tooFar) {
                const dir = MathUtils.multiply(MathUtils.normalize({ x: targetSelection.x - position.x, y: targetSelection.y - position.y }), this.intensity);
                moveDesires.desires.push(dir);
            }
        });
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

export class GoapConnectorModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const approachTargetDesireSystem = new GoapToSteeringDesiresSystem(game);
        game.ecs.addSystem(approachTargetDesireSystem);
        
        const weaponUseSystem = new GoapToWeaponUseSystem(game);
        game.ecs.addSystem(weaponUseSystem);
    }
}