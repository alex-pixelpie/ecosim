import {GetTargetAction} from "../logic/modules/goap/actions/GetTargetAction.ts";
import {KillEnemiesGoal} from "../logic/modules/goap/goals/KillEnemiesGoal.ts";
import {MoveAction} from "../logic/modules/goap/actions/MoveAction.ts";
import {EscapeOverwhelmGoal} from "../logic/modules/goap/goals/EscapeOverwhelmGoal.ts";
import {AttackAction} from "../logic/modules/goap/actions/AttackAction.ts";
import {EscapeOverwhelmAction} from "../logic/modules/goap/actions/EscapeOverwhelmAction.ts";

export interface DropDefinition {
    chance?: number;
    value?: number;
    type: DropType;
}

export interface WeaponConfig {
    damageMin: number;
    damageMax: number;
    cooldownSeconds: number;
    rangeMax: number;
    rangeMin: number;
    swingSeconds: number;
    attackDuration: number;
    criticalChance: number;
    criticalMultiplier: number;
    effect: WeaponEffect;
}

export interface MobConfig {
    type: MobType;
    weaponConfig: WeaponConfig;
    health: number;
    speed: number;
    size: number;
    survivalSecondsToOverwhelm: number;
    drops: DropDefinition[];
    actions: string[]; // Action class names
    goals: string[]; // Goal class names
}

export interface MobSpawnDefinition {
    config: MobConfig;
    count: number;
}

export enum WeaponEffect {
    DirectDamage = 1,
    Arrow = 2
}

export enum MobType {
    Skeleton = 'Skeleton',
    ElfArcher = 'ElfArcher'
}

export enum DropType {
    Corpse = 1,
    Ruin = 2
}

export const SkeletonConfig = {
    type: MobType.Skeleton,
    weaponConfig: {
        damageMax: 20,
        damageMin: 10,
        cooldownSeconds: 0.1,
        rangeMax: 100,
        rangeMin: 50,
        swingSeconds: 0.5,
        attackDuration: 0.75,
        criticalChance: 0.1,
        criticalMultiplier: 2,
        effect: WeaponEffect.DirectDamage
    },
    health: 100,
    speed: 200,
    size: 16,
    survivalSecondsToOverwhelm: 0,
    drops: [{ type: DropType.Corpse }],
    actions: [GetTargetAction.name, MoveAction.name, AttackAction.name],
    goals: [KillEnemiesGoal.name]
};

export const ElfArcherConfig = {
    type: MobType.ElfArcher,
    weaponConfig: {
        damageMax: 20,
        damageMin: 10,
        cooldownSeconds: 1,
        rangeMax: 600,
        rangeMin: 300,
        swingSeconds: 0.5,
        attackDuration: 0.75,
        criticalChance: 0.3,
        criticalMultiplier: 3,
        effect: WeaponEffect.Arrow
    },
    health: 100,
    speed: 300,
    size: 16,
    survivalSecondsToOverwhelm: 3,
    drops: [{ type: DropType.Corpse }],
    actions: [GetTargetAction.name, MoveAction.name, AttackAction.name, EscapeOverwhelmAction.name],
    goals: [KillEnemiesGoal.name, EscapeOverwhelmGoal.name]
};

export class MobsConfig {
    public getMobConfig(type: MobType): MobConfig {
        switch (type) {
            case MobType.Skeleton:
                return SkeletonConfig;
            case MobType.ElfArcher:
                return ElfArcherConfig;
        }
    }
}