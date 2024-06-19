import {GameLogic, GameSystem} from "../GameLogic.ts";
import {GameLogicModule } from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {Dead, DieAndDrop, Health} from "./DeathModule.ts";
import {FrameLog} from "./FrameLogModule.ts";
import {Targetable, TargetGroup} from "./TargetingModule.ts";
import {Configs} from "../../configs/Configs.ts";
import {BuildingConfig, BuildingType} from "../../configs/BuildingsConfig.ts";

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

        BuildingsModule.makeBuilding(game, Configs.buildingsConfig.getConfig(BuildingType.Lair), 1, mapSize/2, mapSize/2);
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
    }
}