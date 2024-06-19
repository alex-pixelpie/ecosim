import {
    DropDefinition,
    DropType,
    ElfArcherConfig,
    MobSpawnDefinition,
    SkeletonConfig,
} from "./MobsConfig.ts";

export enum BuildingType {
    Base = "Base",
    Lair = "Lair",
}

export interface BuildingConfig {
    drops: DropDefinition[];
    health: number;
    spawn: MobSpawnDefinition[];
    size: number;
    type?: BuildingType;
}

const enemyBaseConfig: BuildingConfig = {
    health: 1000,
    spawn: [{ config: { ...SkeletonConfig }, count: 3 }, { config: { ...ElfArcherConfig }, count: 2 }],
    drops: [{ type: DropType.Ruin }],
    size: 140
};

const playerBaseConfig: BuildingConfig = {
    health: 1000,
    spawn: [{ config: { ...SkeletonConfig }, count: 3 }, { config: { ...ElfArcherConfig }, count: 2 }],
    drops: [{ type: DropType.Ruin }],
    size: 140
};

const lairConfig: BuildingConfig = {
    health: 1000,
    spawn: [],
    drops: [{ type: DropType.Ruin }],
    size: 25,
    type: BuildingType.Lair
};

export class BuildingsConfig {
    public getConfig(type: BuildingType): BuildingConfig {
        switch (type) {
            case BuildingType.Base:
                return enemyBaseConfig;
            case BuildingType.Lair:
                return lairConfig;
            default:
                return playerBaseConfig;
        }
    }
}