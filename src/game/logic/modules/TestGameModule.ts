import {GameLogicModule} from "../GameLogicModule.ts";
import {GameLogic} from "../GameLogic.ts";
import {DieAndDrop, Health} from "./DeathModule.ts";
import {FrameLog} from "./FrameLogModule.ts";
import {Building} from "./BuildingsModule.ts";
import {Configs} from "../../configs/Configs.ts";
import {BuildingType} from "../../configs/BuildingsConfig.ts";
import {GroupType, LairMobsSpawner, MobsFactory} from "./MobsModule.ts";
import {MobSpawnDefinition, MobType} from "../../configs/MobsConfig.ts";
import {PatrolGoal} from "./goap/goals/PatrolGoal.ts";
import {MoveAction} from "./goap/actions/MoveAction.ts";
import {TargetGroup} from "./TargetingModule.ts";
import {KillEnemiesGoal} from "./goap/goals/KillEnemiesGoal.ts";
import {LootGoal} from "./goap/goals/LootGoal.ts";
import {StartAttackingEnemiesAction} from "./goap/actions/StartAttackingEnemiesAction.ts";
import {AttackAction} from "./goap/actions/AttackAction.ts";
import {StartLootingAction} from "./goap/actions/StartLootingAction.ts";
import {LootAction} from "./goap/actions/LootAction.ts";
import {Loot, Lootable, LootType} from "./LootModule.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {MathUtils} from "../../utils/Math.ts";
import {StartPatrolAction} from "./goap/actions/StartPatrolAction.ts";

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
            goals:[KillEnemiesGoal.name, LootGoal.name, PatrolGoal.name],
            actions:[StartAttackingEnemiesAction.name, MoveAction.name, AttackAction.name, StartLootingAction.name, LootAction.name, StartPatrolAction.name],
            looting: true,
            patrol: {maxFrequency: 10, minFrequency: 5, range:500, targetRadius: 200, targetPosition: {x: centerPos, y: centerPos}}
        };

        greenSkeletonConfig.config.weaponConfig.damageMax = 1000;
        greenSkeletonConfig.config.sensoryRange = 500;
        
        MobsFactory.makeMob(game, greenSkeletonConfig);
    }

    private addCoins(game: GameLogic, centerPos: number, count = 30) {
        for (let i = 0; i < count; i++) {
            const coin = game.ecs.addEntity();
            const pos = MathUtils.randomPointOnCircumference({x: centerPos, y: centerPos}, 200);
            game.ecs.addComponent(coin, new Loot(LootType.Coin, 10, 1));
            game.ecs.addComponent(coin, new Position(pos.x, pos.y));
            game.ecs.addComponent(coin, new Lootable());
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
        game.addPhysicalComponents({entity: building, x:centerPos, y:centerPos, radius: config.size, isStatic: true});

        const greenSkeletonConfig:MobSpawnDefinition = {
            config:Configs.mobsConfig.getMobConfig(MobType.Skeleton),
            x:centerPos,
            y:centerPos,
            group:GroupType.Red,
            goals:[PatrolGoal.name],
            actions:[StartPatrolAction.name, MoveAction.name],
            patrol: {maxFrequency: 10, minFrequency: 5, range:500, targetRadius: 200, targetPosition: {x: centerPos, y: centerPos}}
        };

        game.ecs.addComponent(building, new LairMobsSpawner(1, 2, greenSkeletonConfig));
    }
}