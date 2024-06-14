import {Entity} from "../../core/ECS.ts";
import {GameLogic, GameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Weapon} from "./weapons/Weapons.ts";
import {FrameLog, FrameLogType} from "./FrameLogModule.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {RangeFromTarget, TargetSelection} from "./TargetingModule.ts";

class AttackSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Weapon, TargetSelection]);

    protected init(): void {
        this.componentsRequired = new Set([Weapon, TargetSelection]);
    }
    
    update(entities: Set<number>, _:number): void {
        const game = this.game;
        
        for (const entity of entities) {
            const weaponComponent = game.ecs.getComponent(entity, Weapon);
            
            const rangeComponent = game.ecs.getComponent(entity, RangeFromTarget);
            if (rangeComponent){
                rangeComponent.maxDistance = weaponComponent.config.rangeMax;
                rangeComponent.minDistance = weaponComponent.config.rangeMin;
            }
            
            if (!weaponComponent.isInUse) {
                continue;
            }
            
            if (weaponComponent.isAttacking(game.timeFromStart)) {
                this.processWeaponAttack(entity, weaponComponent, game);
                continue;
            }
            
            if (weaponComponent.isCoolingDown(game.timeFromStart)) {
                continue;
            }

            weaponComponent.reset();
            weaponComponent.lastAttackTime = game.timeFromStart;
        }
    }

    private processWeaponAttack(entity: Entity, weaponComponent: Weapon, game: GameLogic) {
        const targetSelection = game.ecs.getComponent(entity, TargetSelection);

        const target  = targetSelection?.target;
        // Check if the target is a valid entity
        if (isNaN(target as number)){
            return;
        }
        
        const rangeFromTarget = game.ecs.getComponent(entity, RangeFromTarget);
        if (!rangeFromTarget){
            return;
        }
        
        const position = game.ecs.getComponent(entity, Position);
        if (!position){
            return;
        }
        
        const targetPosition = game.ecs.getComponent(target as number, Position);
        if (!targetPosition){
            return;
        }
        
        const isInRange = rangeFromTarget.inRange(position, targetPosition, targetSelection.targetSize);
        if (!isInRange){
            return;
        }
        
        const ownLog = game.ecs.getComponent(entity, FrameLog);
        ownLog?.logs.push({type: FrameLogType.Attack, value: weaponComponent.damage, timestamp: game.timeFromStart});
        
        if (weaponComponent.isSwinging(game.timeFromStart)){
            return;
        }
        
        if (weaponComponent.appliedEffectThisAttack){
            return;
        }

        weaponComponent.ApplyEffect(game, entity);
    }
}

export class AttackModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const attackSystem = new AttackSystem(game);
        game.ecs.addSystem(attackSystem);
    }
}
