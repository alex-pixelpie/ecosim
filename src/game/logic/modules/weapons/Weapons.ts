import {GameLogic} from "../../GameLogic.ts";
import {Component} from "../../../core/ECS.ts";
import { WeaponEffectDirectDamage } from "./WeaponEffectDirectDamage.ts";
import { WeaponEffectArrow } from "./WeaponEffectArrow.ts";
import {WeaponConfig, WeaponEffect} from "../../../configs/MobsConfig.ts";

export type WeaponEffectFunction = (game: GameLogic, owner:number, weapon:Weapon) => void;
type WeaponEffectsType = Record<WeaponEffect, WeaponEffectFunction>;

const WeaponEffects:WeaponEffectsType = {
    [WeaponEffect.DirectDamage]: WeaponEffectDirectDamage,
    [WeaponEffect.Arrow]: WeaponEffectArrow,
}

export class Weapon extends Component {
    public inUse: boolean = false;
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
        return this.inUse && this.lastAttackTime + this.config.swingSeconds > timeFromStart;
    }

    public isAttacking(timeFromStart: number): boolean {
        return this.inUse && this.lastAttackTime + this.config.attackDuration > timeFromStart;
    }

    public ApplyEffect(game: GameLogic, owner:number): void {
        this.effect(game, owner, this);
    }
}