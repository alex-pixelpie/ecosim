import {
    DropDefinition,
    DropType,
    ElfArcherConfig,
    MobSpawnDefinition,
    SkeletonConfig,
} from "./MobsConfig.ts";

export enum BuildingType {
    Base = "Base"
}

export interface BuildingConfig {
    drops: DropDefinition[];
    health: number;
    spawn: MobSpawnDefinition[];
    size: number;
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

export class BuildingsConfig {
    public getConfig(type: BuildingType): BuildingConfig {
        switch (type) {
            case BuildingType.Base:
                return enemyBaseConfig;
            default:
                return playerBaseConfig;
        }
    }
}