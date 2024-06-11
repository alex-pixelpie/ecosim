import {GameLogic} from "../../GameLogic.ts";
import {Component} from "../../../core/ECS.ts";
import {MathUtils} from "../../../utils/Math.ts";
import {PhysicsModule} from "../PhysicsModule.ts";
import Position = PhysicsModule.Position;
import {Health} from "./Attack.ts";
import {TargetSelection} from "../Targeting.ts";
import {FrameLog} from "../FrameLog.ts";

export class WeaponConfig {
    damageMin:number;
    damageMax:number;
    cooldownSeconds: number;
    rangeMax: number;
    rangeMin: number;
    swingSeconds: number;
    attackDuration: number;
    criticalChance: number;
    criticalMultiplier: number;
    effect:WeaponEffect;
}

export enum WeaponEffect {
    DirectDamage=1,
    Arrow=2,
}

export type WeaponEffectFunction = (game: GameLogic, owner:number, weapon:Weapon) => void;
export type WeaponEffectsType = Record<WeaponEffect, WeaponEffectFunction>;

export const directDamageEffect:WeaponEffectFunction = (game: GameLogic, owner:number, weapon:Weapon): void => {
    const targetSelection = game.ecs.getComponent(owner, TargetSelection);
    const target = targetSelection?.target as number;

    // Check if the target is a valid entity
    if (isNaN(target)){
        return;
    }

    const health = game.ecs.getComponent(target, Health);
    if (!health){
        return;
    }

    const damage = weapon.damage;
    const crit = weapon.criticalDamage;
    const totalDamage = damage * crit;
    health.value -= totalDamage;
    weapon.appliedEffectThisAttack = true;

    const targetLog = game.ecs.getComponent(target, FrameLog.FrameLog);
    targetLog?.logs.push({type: FrameLog.FrameLogType.TakeDamage, value: totalDamage, timestamp: game.timeFromStart});
    crit > 1 && targetLog?.logs.push({type: FrameLog.FrameLogType.TakeCriticalDamage, value: crit, timestamp: game.timeFromStart});
};

export const arrowEffect:WeaponEffectFunction = (game: GameLogic, owner:number, weapon:Weapon): void => {
    const targetSelection = game.ecs.getComponent(owner, TargetSelection);
    const target = targetSelection?.target as number;

    // Check if the target is a valid entity
    if (isNaN(target)){
        return;
    }

    const health = game.ecs.getComponent(target, Health);
    if (!health){
        return;
    }

    const damage = weapon.damage;
    const crit = weapon.criticalDamage;
    const totalDamage = damage * crit;
    health.value -= totalDamage;
    weapon.appliedEffectThisAttack = true;

    const targetLog = game.ecs.getComponent(target, FrameLog.FrameLog);
    targetLog?.logs.push({type: FrameLog.FrameLogType.TakeDamage, value: totalDamage, timestamp: game.timeFromStart});
    crit > 1 && targetLog?.logs.push({type: FrameLog.FrameLogType.TakeCriticalDamage, value: crit, timestamp: game.timeFromStart});
};

export const WeaponEffects:WeaponEffectsType = {
    [WeaponEffect.DirectDamage]: directDamageEffect,
    [WeaponEffect.Arrow]: arrowEffect,
}

export class Weapon extends Component {
    public isInUse: boolean = false;
    public lastAttackTime: number = 0;
    public appliedEffectThisAttack: boolean = false;

    public get dps(): number {
        return this.averageDamage / this.config.attackDuration;
    }
    
    public get averageDamage(): number {
        return (this.config.damageMin + this.config.damageMax) / 2;
    }
    
    public get damage(): number {
        const damageRange = this.config.damageMax - this.config.damageMin;
        return this.config.damageMin + Math.floor(Math.random() * damageRange);
    }

    public get criticalDamage() : number {
        return Math.random() < this.config.criticalChance ? this.config.criticalMultiplier : 1;
    }

    private readonly effect: WeaponEffectFunction;

    constructor(public config: WeaponConfig) {
        super();
        this.effect = WeaponEffects[config.effect];
    }

    public reset(): void {
        this.appliedEffectThisAttack = false;
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

        return MathUtils.distance(ownerPosition, targetPosition) <= this.config.rangeMax;
    }

    public ApplyEffect(game: GameLogic, owner:number): void {
        this.effect(game, owner, this);
    }
}