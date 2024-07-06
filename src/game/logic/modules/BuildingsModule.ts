import {GameLogic, GameSystem} from "../GameLogic.ts";
import {GameLogicModule } from "../GameLogicModule.ts";
import {Component, Entity} from "../../core/ECS.ts";
import {BuildingConfig} from "../../configs/BuildingsConfig.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {FrameLog} from "./FrameLogModule.ts";
import {Observable} from "./SensoryModule.ts";
import {GroupType, LairMobsSpawner} from "./MobsModule.ts";
import {TargetGroup} from "./TargetingModule.ts";
import {Configs} from "../../configs/Configs.ts";
import {MathUtils, Pos} from "../../utils/Math.ts";

export interface BuildingSpawnDefinition {
    config: BuildingConfig;
    x: number;
    y: number;
    group:GroupType;
}

export class BuildingsFactory {
    static makeBuilding(game: GameLogic, {config, x, y, group}: BuildingSpawnDefinition) : Entity {
        const building = game.ecs.addEntity();
        
        game.ecs.addComponent(building, new Building(config));
        config.conquest && game.ecs.addComponent(building, new Conquerable(config.conquest.cost, group));
        game.ecs.addComponent(building, new Position(x, y));
        game.ecs.addComponent(building, new FrameLog());
        game.ecs.addComponent(building, new Observable());
        game.ecs.addComponent(building, new TargetGroup(group));
        game.addPhysicalComponents({entity: building, x, y, radius: config.size, isStatic: true});
        config.spawn && game.ecs.addComponent(building, new LairMobsSpawner(config.spawn.maxMobs, config.spawn.spawnIntervalSeconds, config.spawn.mobConfig));

        return building;
    }
}

export class Building extends Component {
    constructor(public config: BuildingConfig) {
        super();
    }
}

export class Conqueror extends Component {
    get conquering(): boolean {
        return this.target !== null;
    }

    target: number | null = null;
    x: number = 0;
    y: number = 0;
    targetSize: number = 0;

    constructor(public conquestPerSecond: number, public ownSize:number) {
        super();
    }

    distanceFromTarget(from: Pos): number {
        return MathUtils.distance(from, this) - this.ownSize;
    }

    startConquering(target: number, targetSize:number, x:number, y:number): void {
        this.target = target;
        this.targetSize = targetSize/2;
        this.x = x;
        this.y = y;
    }

    stopConquering(){
        this.target = null;
    }

    inRange(from: Pos): boolean {
        let distance = MathUtils.distance(from, this) - this.targetSize - this.ownSize;
        return distance <= 0;
    }
}

export class Conquerable extends Component {
    conquestPoints = 0;
    
    get conquered(): boolean {
        return this.conquestPoints >= this.conquestCost;
    }

    constructor(public conquestCost: number, public group: GroupType) {
        super();
    }
}

export class ConquestSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Conqueror]);

    protected init(): void {
        this.componentsRequired = new Set([Conqueror]);
    }
    
    update(entities: Set<number>, delta: number): void {
        for (const entity of entities) {
            const conqueror = this.game.ecs.getComponent(entity, Conqueror);
            if (!conqueror || !conqueror.conquering) {
                continue;
            }
            
            const conquerable = this.game.ecs.getComponent(conqueror.target!, Conquerable);
            
            if (conquerable.conquered) {
                const target = conqueror.target!;

                const building = this.game.ecs.getComponent(target, Building);
                const position = this.game.ecs.getComponent(target, Position);
                const ownGroup = this.game.ecs.getComponent(target, TargetGroup);
                
                if (!position) {
                    continue;
                }
                
                const config = Configs.buildingsConfig.getConfig(building.config.conquest!.replaceWith);
                const group = ownGroup!.id == GroupType.Green ? GroupType.Red : GroupType.Green;
                
                BuildingsFactory.makeBuilding(this.game, {...position, group, config});
                
                this.game.removePhysicalComponents(target);
                this.game.ecs.removeEntity(target);
                
                conqueror.stopConquering();
            }
        }
    }
}

export class BuildingsModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const conquestSystem = new ConquestSystem(game);
        game.ecs.addSystem(conquestSystem);
    }
}