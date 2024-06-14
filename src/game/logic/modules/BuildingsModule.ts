import {GameLogic, GameSystem} from "../GameLogic.ts";
import {GameLogicModule } from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {Dead, DieAndDrop, Health} from "./DeathModule.ts";
import {EventBus, GameEvents} from "../../EventBus.ts";
import {FrameLog} from "./FrameLogModule.ts";
import {MobsSpawn} from "./MobsModule.ts";
import {Targetable, TargetGroup} from "./TargetingModule.ts";
import {Configs} from "../../configs/Configs.ts";
import {BuildingConfig, BuildingType} from "../../configs/BuildingsConfig.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {MathUtils, Pos} from "../../utils/Math.ts";

export class Building extends Component {
    constructor(public type: BuildingType = BuildingType.Base) {
        super();
    }
}

export class Home extends Component {
    public x: number = 0;
    public y: number = 0;
    
    constructor(public entity: number, public homeSize: number, public ownSize: number, public maxDistance: number, public safeDistance: number) {
        super();
    }
    
    distance(from: Pos): number {
        return MathUtils.distance(from, this) - this.homeSize;
    }

    inRange(from: Pos): boolean {
        let distance = MathUtils.distance(from, this) - this.ownSize - this.homeSize;
        return distance <= this.maxDistance;
    }

    isSafe(from: Pos): boolean {
        const distance = MathUtils.distance(from, this) - this.ownSize - this.homeSize;
        return distance < this.safeDistance;
    }
}

class HomeUpdateSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Home]);
    
    protected init(): void {
        this.componentsRequired = new Set([Home]);
    }
    
    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const home = this.game.ecs.getComponent<Home>(entity, Home);
            const building = this.game.ecs.getComponent<Building>(home.entity, Building);
            
            if (!building){
                this.game.ecs.removeComponent(entity, Home); // TODO - improve homelessness logic
                return;
            }
            
            const position = this.game.ecs.getComponent(home.entity, Position);
            if (position){
                home.x = position.x;
                home.y = position.y;
            }
        });
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

                const group = this.game.ecs.getComponent(entity, TargetGroup);
                const victory = !!(group.id === 0 ? 1 : 0);
                
                EventBus.emit(GameEvents.GameOver, {victory});
            }
        });
    }
}

export class BuildingsModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const basesSystem = new BuildingsDeathSystem(game);
        game.ecs.addSystem(basesSystem);

        const homeSystem = new HomeUpdateSystem(game);
        game.ecs.addSystem(homeSystem);
        
        const playerBaseConfig = Configs.buildingsConfig.getConfig(BuildingType.Base);
        const mapSize = Configs.mapConfig.pixelsSize;
        const offset = 100;
        const baseSize = 140;
        
        // BuildingsModule.makeBuilding(game, playerBaseConfig, 0, offset+baseSize, offset+baseSize);
        // BuildingsModule.makeBuilding(game, playerBaseConfig, 1, mapSize-offset-baseSize, mapSize-offset-baseSize);
    }
    
    static makeBuilding(game: GameLogic, config:BuildingConfig, group: number, x: number, y: number){
        const building = game.ecs.addEntity();
        game.ecs.addComponent(building, new Building());
        game.ecs.addComponent(building, new DieAndDrop(config.drops));
        game.ecs.addComponent(building, new Health(config.health));
        game.ecs.addComponent(building, new TargetGroup(group));
        game.ecs.addComponent(building, new Targetable());
        game.ecs.addComponent(building, new FrameLog());
        game.ecs.addComponent(building, new MobsSpawn(config.spawn, group, {x, y}));
        game.addPhysicalComponents({entity: building, x, y, width: config.size, height: config.size, isStatic: true});
    }
}