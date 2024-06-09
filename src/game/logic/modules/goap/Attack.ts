import {GameLogic, GameSystem} from "../../GameLogic.ts";
import {Action} from "./Action.ts";
import {MobGoapState} from "./MobGoapState.ts";
import {Component, Entity} from "../../../core/ECS.ts";
import {TargetSelection} from "./Targeting.ts";
import {MobGoapStateComponent} from "./MobGoapStateComponent.ts";
import {PhysicsModule} from "../PhysicsModule.ts";
import Position = PhysicsModule.Position;
import {MathUtils} from "../../../utils/Math.ts";
import {FrameLog} from "./FrameLog.ts";

export class AttackAction implements Action {
    preconditions = {[MobGoapState.hasTarget]: true, [MobGoapState.inRange]: true};
    effects = {[MobGoapState.hasTarget]: false};
    cost: number;

    constructor() {
        this.cost = 5;
    }

    isValid(state: Record<string, boolean>): boolean {
        return state[MobGoapState.hasTarget] && state[MobGoapState.inRange];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }
    
    hasCompleted(entity: number, game: GameLogic): boolean {
        const targetSelectionComponent = game.ecs.getComponent<TargetSelection>(entity, TargetSelection);
        
        if (!targetSelectionComponent || isNaN(targetSelectionComponent.target as number)) {
            return true;
        }
        
        const healthComponent = game.ecs.getComponent(entity, Health);
        
        if (!healthComponent) {
            return true;
        }
        
        return healthComponent.value <= 0;
    }
}

export class Health extends Component {
    constructor(public value: number) {
        super();
    }
}

export class WeaponConfig {
    damageMin:number;
    damageMax:number;
    cooldownSeconds: number;
    range: number; 
    swingSeconds: number;
    attackDuration: number;
    criticalChance: number;
    criticalMultiplier: number;
}

export class Weapon extends Component {
    public lastAttackTime: number = 0;
    public causedDamage: boolean = false;
    
    public get damage(): number {
        const damageRange = this.config.damageMax - this.config.damageMin;
        return this.config.damageMin + Math.floor(Math.random() * damageRange);
    }
    
    public get criticalDamage() : number {
        return Math.random() < this.config.criticalChance ? this.config.criticalMultiplier : 1;
    }
    
    constructor(public config: WeaponConfig) {
        super();
    }
    
    public reset(): void {
        this.causedDamage = false;
    }
    
    public isCoolingDown(timeFromStart: number): boolean {
        return this.lastAttackTime + this.config.attackDuration + this.config.cooldownSeconds > timeFromStart;
    }
    
    public isSwinging(timeFromStart: number): boolean {
        return this.lastAttackTime + this.config.swingSeconds > timeFromStart;
    }
    
    public isAttacking(timeFromStart: number): boolean {
        return this.lastAttackTime + this.config.attackDuration > timeFromStart;
    }

    public isInRange(game: GameLogic, target: number, owner:number): boolean {
        const ownerPosition = game.ecs.getComponent(owner, Position);
        const targetPosition = game.ecs.getComponent(target, Position);

        if (!ownerPosition || !targetPosition){
            return false;
        }
        
        return MathUtils.distance(ownerPosition, targetPosition) <= this.config.range;
    }
}

export class DeathSystem extends GameSystem {
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

            game.removePhysicalComponents(entity);
            game.mobs.delete(entity);
            game.ecs.removeEntity(entity);
        }
    }
}

export class AttackSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Weapon, TargetSelection]);

    protected init(): void {
        this.componentsRequired = new Set([Weapon, TargetSelection]);
    }
    
    update(entities: Set<number>, _:number): void {
        const game = this.game;
        
        for (const entity of entities) {
            const weaponComponent = game.ecs.getComponent(entity, Weapon);
            
            // Check if the entity has a weapon or the weapon is not ready to attack
            if (!weaponComponent) {
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
        const state = game.ecs.getComponent(entity, MobGoapStateComponent);
        if (state != null){
            state.state[MobGoapState.inRange] = isInRange;
        }
        
        if (!isInRange){
            return;
        }
        
        const target = targetSelection.target as number;
        const health = game.ecs.getComponent(target, Health);

        if (!health){
            return;
        }

        const ownLog = game.ecs.getComponent(entity, FrameLog.FrameLog);
        ownLog?.logs.push({type: FrameLog.FrameLogType.Attack, value: weaponComponent.damage, timestamp: game.timeFromStart});

        if (weaponComponent.isSwinging(game.timeFromStart)){
            return;
        }
        
        if (weaponComponent.causedDamage){
            return;
        }
        
        const damage = weaponComponent.damage;
        const crit = weaponComponent.criticalDamage;
        const totalDamage = damage * crit;
        health.value -= totalDamage;
        weaponComponent.causedDamage = true;
        
        const targetLog = game.ecs.getComponent(target, FrameLog.FrameLog);
        targetLog?.logs.push({type: FrameLog.FrameLogType.TakeDamage, value: totalDamage, timestamp: game.timeFromStart});
        crit > 1 && targetLog?.logs.push({type: FrameLog.FrameLogType.TakeCriticalDamage, value: crit, timestamp: game.timeFromStart});
    }
}
