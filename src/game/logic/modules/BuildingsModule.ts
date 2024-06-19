import {GameLogic, GameSystem} from "../GameLogic.ts";
import {GameLogicModule } from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {Corpse, Dead, DieAndDrop, Health} from "./DeathModule.ts";
import {FrameLog} from "./FrameLogModule.ts";
import {Targetable, TargetGroup} from "./TargetingModule.ts";
import {Configs} from "../../configs/Configs.ts";
import {BuildingConfig, BuildingType} from "../../configs/BuildingsConfig.ts";
import {MobSpawnDefinition, MobType} from "../../configs/MobsConfig.ts";
import {GroupType, LairMobsSpawner} from "./MobsModule.ts";
import {PatrolGoal} from "./goap/goals/PatrolGoal.ts";
import {StartPatrolAction} from "./goap/actions/StartPatrolAction.ts";
import {MoveAction} from "./goap/actions/MoveAction.ts";

export class Building extends Component {
    constructor(public type: BuildingType = BuildingType.Base) {
        super();
    }
}

class BuildingsDeathSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Building]);
    
    protected init(): void {
        this.componentsRequired = new Set([Building]);
    }
    
    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const health = this.game.ecs.getComponent<Health>(entity, Health);
             
            if (health.value <= 0){
                this.game.ecs.addComponent(entity, new Dead());
                
                // TODO - handle this
            }
        });
    }
}

export class BuildingsModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const basesSystem = new BuildingsDeathSystem(game);
        game.ecs.addSystem(basesSystem);
        
        const playerBaseConfig = Configs.buildingsConfig.getConfig(BuildingType.Base);
        const mapSize = Configs.mapConfig.pixelsSize;
        const offset = 100;
        const baseSize = 140;
        
        // BuildingsModule.makeBuilding(game, playerBaseConfig, 0, offset+baseSize, offset+baseSize);
        // BuildingsModule.makeBuilding(game, playerBaseConfig, 1, mapSize-offset-baseSize, mapSize-offset-baseSize);

        const pos = mapSize/2;
        const group = GroupType.Red;
        
        const lair = BuildingsModule.makeBuilding(game, Configs.buildingsConfig.getConfig(BuildingType.Lair), group, pos, pos);

        const redSkeletonConfig:MobSpawnDefinition = {
            config:Configs.mobsConfig.getMobConfig(MobType.Skeleton),
            x:pos,
            y:pos,
            group:group,
            goals:[PatrolGoal.name],
            actions:[StartPatrolAction.name, MoveAction.name],
            patrol: {maxFrequency: 10, minFrequency: 5, range:500, targetRadius: 200, targetPosition: {x: pos, y: pos}}
        };
        
        game.ecs.addComponent(lair, new LairMobsSpawner(5, 2, redSkeletonConfig));
    }

    static makeBuilding(game: GameLogic, config:BuildingConfig, group: number, x: number, y: number){
        const building = game.ecs.addEntity();
        game.ecs.addComponent(building, new Building(config.type));
        game.ecs.addComponent(building, new DieAndDrop(config.drops));
        game.ecs.addComponent(building, new Health(config.health));
        game.ecs.addComponent(building, new TargetGroup(group));
        game.ecs.addComponent(building, new Targetable());
        game.ecs.addComponent(building, new FrameLog());
        game.addPhysicalComponents({entity: building, x, y, radius: config.size, isStatic: true});
        return building;
    }
}