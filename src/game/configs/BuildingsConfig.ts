import {
    MobSpawnDefinition,
} from "./MobsConfig.ts";

export enum BuildingType {
    MobTower = "MobTower",
    PlayerTower = "PlayerTower",
}

export interface ConquestConfig {
    cost: number;
    replaceWith: BuildingType;
}

export interface SpawnMobsConfig {
    maxMobs: number;
    spawnIntervalSeconds: number;
    mobConfig: MobSpawnDefinition;
}

export interface BuildingConfig {
    spawn?: SpawnMobsConfig;
    conquest?: ConquestConfig;
    type: BuildingType;
    size: number;
    sensoryRange?: number;
}

const mobTowerConfig: BuildingConfig = {
    size: 25,
    type: BuildingType.MobTower,
    conquest: {
        cost: 1000,
        replaceWith: BuildingType.PlayerTower
    },
    sensoryRange: 500,
};

const playerBaseConfig: BuildingConfig = {
    size: 25,
    type: BuildingType.PlayerTower,
    conquest: {
        cost: 1000,
        replaceWith: BuildingType.MobTower
    },
    sensoryRange: 500
};

export class BuildingsConfig {
    public getConfig(type: BuildingType): BuildingConfig {
        switch (type) {
            case BuildingType.MobTower:
                return mobTowerConfig;
            case BuildingType.PlayerTower:
                return playerBaseConfig;
            default:
                return playerBaseConfig;
        }
    }
}