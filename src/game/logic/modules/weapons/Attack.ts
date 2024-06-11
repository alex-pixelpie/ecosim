import {Component, Entity} from "../../../core/ECS.ts";
import {GameLogic, GameLogicModule, GameSystem} from "../../GameLogic.ts";
import {Weapon} from "./Weapons.ts";
import {RangeFromTarget, TargetSelection} from "../Targeting.ts";
import {FrameLog} from "../FrameLog.ts";
import {Mob, MobType} from "../MobsModule.ts";
import {PhysicsModule} from "../PhysicsModule.ts";
import Position = PhysicsModule.Position;

export class Health extends Component {
    maxValue: number;
    
    constructor(public value: number) {
        super();
        this.maxValue = value;
    }
}

export class Corpse extends Component {
    public maxAge = 30;
    public age = 0;
    
    constructor(public type: MobType, public x: number, public y: number) {
        super();
    }
}

class CorpseRotSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Corpse]);

    protected init(): void {
        this.componentsRequired = new Set([Corpse]);
    }
    
    update(entities: Set<number>, delta:number): void {
        for (const entity of entities) {
            const corpse = this.game.ecs.getComponent(entity, Corpse);
            if (!corpse){
                continue;
            }
            
            corpse.age+=delta;
            if (corpse.age > corpse.maxAge){
                this.game.ecs.removeEntity(entity);
            }
        }
    }

}

class DeathSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Health]);

    protected init(): void {
        this.componentsRequired = new Set([Health]);
    }
    
    update(entities: Set<number>, _:number): void {
        const game = this.game;

        for (const entity of entities) {
            const health = game.ecs.getComponent(entity, Health);

            if (!health || health.value > 0) {
                continue;
            }
            
            // Move Mob and MobMobType away from MobsModule
            this.dropCorpse(game, entity);

            game.removePhysicalComponents(entity);
            game.mobs.delete(entity);
            game.ecs.removeEntity(entity);
        }
    }

    private dropCorpse(game: GameLogic, entity: number) {
        const position = game.ecs.getComponent(entity, Position);
        const mob = game.ecs.getComponent(entity, Mob);
        const frameLog = game.ecs.getComponent(entity, FrameLog.FrameLog);
        
        if (position && mob && frameLog){
            const corpseEntity = game.ecs.addEntity();
            game.ecs.addComponent(corpseEntity, new Corpse(mob.type, position.x, position.y));
            
            // Copy the frame log to the corpse
            const log = new FrameLog.FrameLog();
            log.logs = [...frameLog.logs];
            game.ecs.addComponent(corpseEntity, log);
        }
    }
}

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

        // Check if the target is a valid entity
        if (isNaN(targetSelection?.target as number)){
            return;
        }
        
        const isInRange = weaponComponent.isInRange(game, targetSelection.target as number, entity);
        if (!isInRange){
            return;
        }
        
        const ownLog = game.ecs.getComponent(entity, FrameLog.FrameLog);
        ownLog?.logs.push({type: FrameLog.FrameLogType.Attack, value: weaponComponent.damage, timestamp: game.timeFromStart});
        
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
        
        const deathSystem = new DeathSystem(game);
        game.ecs.addSystem(deathSystem);
        
        const corpseRotSystem = new CorpseRotSystem(game);
        game.ecs.addSystem(corpseRotSystem);
    }
}
