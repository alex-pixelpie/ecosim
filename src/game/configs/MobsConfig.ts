import {Pos} from "../utils/Math.ts";

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

export interface PatrolConfig {
    range: number;
    minFrequency: number;
    maxFrequency: number;
    targetPosition: Pos;
    targetRadius: number;
}

export interface MobConfig {
    type: MobType;
    weaponConfig: WeaponConfig;
    health: number;
    speed: number;
    size: number;
    sensoryRange: number;
    survivalSecondsToOverwhelm: number;
    drops: DropDefinition[];
    behaviors?: string[];
    patrol?:PatrolConfig;
    avoidWalls?: boolean;
    looting?: boolean;
    conquestPointsPerSecond?: number;
}

export interface MobSpawnDefinition {
    config: MobConfig;
    x: number;
    y: number;
    group: number;
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
    Ruin = 2,
    Coin = 3
}

export const SkeletonConfig: MobConfig = {
    type: MobType.Skeleton,
    weaponConfig: {
        damageMax: 20,
        damageMin: 10,
        cooldownSeconds: 0.1,
        rangeMax: 50,
        rangeMin: 20,
        swingSeconds: 0.5,
        attackDuration: 0.75,
        criticalChance: 0.1,
        criticalMultiplier: 2,
        effect: WeaponEffect.DirectDamage
    },
    health: 100,
    speed: 200,
    size: 16,
    sensoryRange: 300,
    survivalSecondsToOverwhelm: 0,
    drops: [{ type: DropType.Corpse }, { type: DropType.Coin, value: 1, chance: 1 }],
    avoidWalls: true
};

export const ElfArcherConfig : MobConfig = {
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
    sensoryRange: 1000,
    speed: 300,
    size: 16,
    survivalSecondsToOverwhelm: 3,
    drops: [{ type: DropType.Corpse }, { type: DropType.Coin, value: 1, chance: 0.5 }],
    avoidWalls: true
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