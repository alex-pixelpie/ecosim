import {Entity} from "../../core/ECS.ts";
import {GameLogic, GameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Weapon} from "./weapons/Weapons.ts";
import {FrameLog, FrameLogType} from "./FrameLogModule.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {TargetOfAttack} from "./TargetingModule.ts";

class AttackSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Weapon, TargetOfAttack]);

    protected init(): void {
        this.componentsRequired = new Set([Weapon, TargetOfAttack]);
    }
    
    update(entities: Set<number>, _:number): void {
        const game = this.game;
        
        for (const entity of entities) {
            const attackComponent = game.ecs.getComponent(entity, TargetOfAttack);
            
            if (!attackComponent.attacking){
                continue;
            }
            
            const targetPosition = game.ecs.getComponent(attackComponent.target!, Position);
            if (targetPosition){
                attackComponent.x = targetPosition.x;
                attackComponent.y = targetPosition.y;
            }
            
            const weaponComponent = game.ecs.getComponent(entity, Weapon);

            attackComponent.minAttackRange = weaponComponent.config.rangeMin;
            attackComponent.maxAttackRange = weaponComponent.config.rangeMax;
            if (!weaponComponent.inUse) {
                continue;
            }
            
            if (weaponComponent.isAttacking(game.currentTime)) {
                this.processWeaponAttack(entity, weaponComponent, game);
                continue;
            }
            
            if (weaponComponent.isCoolingDown(game.currentTime)) {
                continue;
            }

            weaponComponent.reset();
            weaponComponent.lastAttackTime = game.currentTime;
        }
    }

    private processWeaponAttack(entity: Entity, weaponComponent: Weapon, game: GameLogic) {
        const attackTarget = game.ecs.getComponent(entity, TargetOfAttack);

        if (!attackTarget.attacking) {
            return;
        }
        
        const position = game.ecs.getComponent(entity, Position);
        if (!position){
            return;
        }
        
        const isInRange = attackTarget.inRange(position);
        if (!isInRange){
            return;
        }
        
        const ownLog = game.ecs.getComponent(entity, FrameLog);
        ownLog?.logs.push({type: FrameLogType.Attack, value: weaponComponent.damage, timestamp: game.currentTime});
        
        if (weaponComponent.isSwinging(game.currentTime)){
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
