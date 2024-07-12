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
import {PatrolBehavior} from "./utility-behavior/PatrolBehavior.ts";
import {IdleBehavior} from "./utility-behavior/IdleBehavior.ts";
import {FightBehavior} from "./utility-behavior/FightBehavior.ts";
import {EventBus, GameEvents} from "../../EventBus.ts";
import {Observable} from "./SensoryModule.ts";
import {LootBehavior} from "./utility-behavior/LootBehavior.ts";
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
        const config = {...Configs.mobsConfig.getMobConfig(MobType.BlueKing)};
        config.weaponConfig = {...config.weaponConfig};
        config.behaviors = [LootBehavior.name, IdleBehavior.name, FightBehavior.name, ConquerBehavior.name, ExploreBehavior.name, ReturnLootBehavior.name];

        const heroConfig:MobSpawnDefinition = {
            config,
            x:centerPos-450,
            y:centerPos,
            group:GroupType.Green
        };

        // MobsFactory.makeMob(game, heroConfig);
        const hero = MobsFactory.makeMob(game, heroConfig);

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
        
        const skeletonConfig = {...Configs.mobsConfig.getMobConfig(MobType.Skeleton)};
        skeletonConfig.patrol = {maxFrequency: 10, minFrequency: 5, range:500, targetRadius: 200, targetPosition: {x: pos.x, y: pos.y}};
        skeletonConfig.behaviors = [PatrolBehavior.name, IdleBehavior.name, FightBehavior.name];
        skeletonConfig.speed = 100;
        skeletonConfig.sensoryRange = 100;
        skeletonConfig.weaponConfig = {...skeletonConfig.weaponConfig};
        skeletonConfig.weaponConfig.damageMax = 30;
        skeletonConfig.weaponConfig.damageMin = 10;

        const spawnConfig:MobSpawnDefinition = {
            config: skeletonConfig,
            x:pos.x,
            y:pos.y,
            group:GroupType.Red
        };

        const buildingConfig = {...Configs.buildingsConfig.getConfig(BuildingType.MobTower)};
        buildingConfig.spawn = {
            mobConfig:spawnConfig,
            maxMobs: 10,
            spawnIntervalSeconds: 2
        }
        
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