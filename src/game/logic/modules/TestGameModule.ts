import {GameLogicModule} from "../GameLogicModule.ts";
import {GameLogic} from "../GameLogic.ts";
import {BuildingsFactory} from "./BuildingsModule.ts";
import {Configs} from "../../configs/Configs.ts";
import {BuildingType} from "../../configs/BuildingsConfig.ts";
import {GroupType, MobsFactory} from "./MobsModule.ts";
import {MobSpawnDefinition, MobType} from "../../configs/MobsConfig.ts";
import {Loot, Lootable, LootType} from "./LootModule.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {MathUtils} from "../../utils/Math.ts";
import {LootBehavior} from "./utility-behavior/LootBehavior.ts";
import {PatrolBehavior} from "./utility-behavior/PatrolBehavior.ts";
import {IdleBehavior} from "./utility-behavior/IdleBehavior.ts";
import {FightBehavior} from "./utility-behavior/FightBehavior.ts";
import {EventBus, GameEvents} from "../../EventBus.ts";
import {Observable} from "./SensoryModule.ts";
import {ConquerBehavior} from "./utility-behavior/ConquerBehavior.ts";
import {ExploreBehavior} from "./utility-behavior/ExploreBehavior.ts";
import {ReturnLootBehavior} from "./utility-behavior/ReturnLootBehavior.ts";

export class TestGameModule extends GameLogicModule {
    init(game: GameLogic): void {
        const mapSize = Configs.mapConfig.pixelsSize;
        const centerPos = mapSize/2;

        this.addPlayerTower(game, centerPos);
        this.addMobTower(game, centerPos);
        this.addHero(game, centerPos);
        this.addCoins(game, centerPos, centerPos);
    }

    private addHero(game: GameLogic, centerPos: number) {
        const config = {...Configs.mobsConfig.getMobConfig(MobType.Skeleton)};
        config.patrol = {maxFrequency: 10, minFrequency: 5, range:500, targetRadius: 200, targetPosition: {x: centerPos, y: centerPos}};
        config.weaponConfig.damageMax = 1000;
        config.sensoryRange = 250;
        config.looting = true;
        config.behaviors = [LootBehavior.name, IdleBehavior.name, FightBehavior.name, ConquerBehavior.name, ExploreBehavior.name, ReturnLootBehavior.name];
        config.conquestPointsPerSecond = 100;
        
        const greenSkeletonConfig:MobSpawnDefinition = {
            config,
            x:centerPos-450,
            y:centerPos,
            group:GroupType.Green
        };

        MobsFactory.makeMob(game, greenSkeletonConfig);
        const hero = MobsFactory.makeMob(game, greenSkeletonConfig);

        // Select this motherfucker
        game.scene.time.delayedCall(100, () => {
            EventBus.emit(GameEvents.EntityTap, hero);
            }
        );
    }

    private addCoins(game: GameLogic, x: number, y:number, count = 30) {
        for (let i = 0; i < count; i++) {
            const coin = game.ecs.addEntity();
            const pos = MathUtils.randomPointOnCircumference({x, y}, 200);
            game.ecs.addComponent(coin, new Loot(LootType.Coin, 10, 1));
            game.ecs.addComponent(coin, new Position(pos.x, pos.y));
            game.ecs.addComponent(coin, new Lootable());
            game.ecs.addComponent(coin, new Observable());
        }
    }
    
    private addMobTower(game: GameLogic, centerPos: number) {
        const pos = MathUtils.randomPointOnCircumference({x: centerPos, y: centerPos}, 1000);

        const spawnConfig:MobSpawnDefinition = {
            config: {...Configs.mobsConfig.getMobConfig(MobType.Skeleton)},
            x:pos.x,
            y:pos.y,
            group:GroupType.Red
        };
        spawnConfig.config.patrol = {maxFrequency: 10, minFrequency: 5, range:500, targetRadius: 200, targetPosition: {x: pos.x, y: pos.y}};
        spawnConfig.config.behaviors = [PatrolBehavior.name, IdleBehavior.name];
        spawnConfig.config.speed = 500;
        spawnConfig.config.sensoryRange = 500;

        const buildingConfig = {...Configs.buildingsConfig.getConfig(BuildingType.MobTower)};
        // buildingConfig.spawn = {
        //     mobConfig:spawnConfig,
        //     maxMobs: 10,
        //     spawnIntervalSeconds: 2
        // }
        
        BuildingsFactory.makeBuilding(game, {
            x:pos.x,
            y:pos.y,
            config: buildingConfig,
            group:GroupType.Red
        });
        
        this.addCoins(game, pos.x,  pos.y,20);
    }

    private addPlayerTower(game: GameLogic, centerPos: number) {
        const pos = {x: centerPos, y: centerPos};

        const buildingConfig = {...Configs.buildingsConfig.getConfig(BuildingType.PlayerTower)};

        BuildingsFactory.makeBuilding(game, {
            x:pos.x,
            y:pos.y,
            config: buildingConfig,
            group:GroupType.Green
        });
    }
}