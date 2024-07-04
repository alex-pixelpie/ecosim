import {GameLogicModule} from "../GameLogicModule.ts";
import {GameLogic} from "../GameLogic.ts";
import {DieAndDrop, Health} from "./DeathModule.ts";
import {FrameLog} from "./FrameLogModule.ts";
import {Building} from "./BuildingsModule.ts";
import {Configs} from "../../configs/Configs.ts";
import {BuildingType} from "../../configs/BuildingsConfig.ts";
import {GroupType, LairMobsSpawner, MobsFactory} from "./MobsModule.ts";
import {MobSpawnDefinition, MobType} from "../../configs/MobsConfig.ts";
import {TargetGroup} from "./TargetingModule.ts";
import {Loot, Lootable, LootType} from "./LootModule.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {MathUtils} from "../../utils/Math.ts";
import {UtilityBehavior} from "./utility-behavior/UtilityBehaviorModule.ts";
import {LootBehavior} from "./utility-behavior/LootBehavior.ts";
import {PatrolBehavior} from "./utility-behavior/PatrolBehavior.ts";
import {IdleBehavior} from "./utility-behavior/IdleBehavior.ts";
import {FightBehavior} from "./utility-behavior/FightBehavior.ts";
import {EventBus, GameEvents} from "../../EventBus.ts";
import {Observable} from "./SensoryModule.ts";

export class TestGameModule extends GameLogicModule {
    init(game: GameLogic): void {
        const mapSize = Configs.mapConfig.pixelsSize;
        const centerPos = mapSize/2;
        
        this.addLair(game, centerPos);
        this.addHero(game, centerPos);
        this.addCoins(game, centerPos);
    }

    private addHero(game: GameLogic, centerPos: number) {
        const greenSkeletonConfig:MobSpawnDefinition = {
            config:Configs.mobsConfig.getMobConfig(MobType.Skeleton),
            x:centerPos-450,
            y:centerPos,
            group:GroupType.Green,
            looting: true,
            patrol: {maxFrequency: 10, minFrequency: 5, range:500, targetRadius: 200, targetPosition: {x: centerPos, y: centerPos}}
        };

        greenSkeletonConfig.config.weaponConfig.damageMax = 1000;
        greenSkeletonConfig.config.sensoryRange = 250;

        const hero = MobsFactory.makeMob(game, greenSkeletonConfig);
        const hero2 = MobsFactory.makeMob(game, greenSkeletonConfig);

        // Utility behavior
        game.ecs.addComponent(hero, new UtilityBehavior([new LootBehavior(), new PatrolBehavior(), new IdleBehavior(), new FightBehavior()], GroupType.Green));
        game.ecs.addComponent(hero2, new UtilityBehavior([new LootBehavior(), new PatrolBehavior(), new IdleBehavior(), new FightBehavior()], GroupType.Green));

        // Select this motherfucker
        game.scene.time.delayedCall(100, () => {
            EventBus.emit(GameEvents.EntityTap, hero);
            }
        );

    }

    private addCoins(game: GameLogic, centerPos: number, count = 30) {
        for (let i = 0; i < count; i++) {
            const coin = game.ecs.addEntity();
            const pos = MathUtils.randomPointOnCircumference({x: centerPos, y: centerPos}, 200);
            game.ecs.addComponent(coin, new Loot(LootType.Coin, 10, 1));
            game.ecs.addComponent(coin, new Position(pos.x, pos.y));
            game.ecs.addComponent(coin, new Lootable());
            game.ecs.addComponent(coin, new Observable());
        }
    }
    
    private addLair(game: GameLogic, centerPos: number) {
        const building = game.ecs.addEntity();
        const config = Configs.buildingsConfig.getConfig(BuildingType.Lair);
        
        game.ecs.addComponent(building, new Building(config.type));
        game.ecs.addComponent(building, new DieAndDrop(config.drops));
        game.ecs.addComponent(building, new Health(config.health));
        game.ecs.addComponent(building, new FrameLog());
        game.ecs.addComponent(building, new TargetGroup(GroupType.Red));
        game.ecs.addComponent(building, new Observable());
        game.addPhysicalComponents({entity: building, x:centerPos, y:centerPos, radius: config.size, isStatic: true});

        const greenSkeletonConfig:MobSpawnDefinition = {
            config: {...Configs.mobsConfig.getMobConfig(MobType.Skeleton)},
            x:centerPos,
            y:centerPos,
            group:GroupType.Red,
            patrol: {maxFrequency: 10, minFrequency: 5, range:500, targetRadius: 200, targetPosition: {x: centerPos, y: centerPos}},
            behaviors: [PatrolBehavior.name, IdleBehavior.name]
        };

        greenSkeletonConfig.config.speed = 500;
        greenSkeletonConfig.config.sensoryRange = 500;
        game.ecs.addComponent(building, new LairMobsSpawner(8, 2, greenSkeletonConfig));
    }
}