import {ECS, Entity, System} from "../core/ECS.ts";
import {Scene} from "phaser";
import {Configs} from "./modules/ConfigsModule.ts";
import { GameLogicModule } from "./GameLogicModule.ts";

export abstract class GameSystem extends System {
    public constructor(public game: GameLogic) {
        super();
        this.game = game;
        this.init();
    }

    protected abstract init(): void;

    public abstract update(entities: Set<Entity>, delta: number): void;
}

export abstract class TimedGameSystem extends GameSystem {
    protected lastUpdate: number = 0;

    public constructor(public game: GameLogic, public updateInterval: number) {
        super(game);
    }
    
    public update(entities: Set<Entity>,delta: number) {
        this.lastUpdate += delta;
        if (this.lastUpdate > this.updateInterval) {
            this.updateTimed(entities, this.lastUpdate);
            this.lastUpdate = 0;
        }
    }
    
    protected abstract updateTimed(entities: Set<Entity>, delta: number): void;
}

export interface PhysicalComponentCreationData {
    entity: number; 
    x: number;
    y: number;
    radius?:number;
    width?:number;
    height?:number;
    isStatic?:boolean;
    isGameOver?:boolean;
}

export class GameLogic {
    ecs: ECS;
    scene: Phaser.Scene;
    timeFromStart: number = 0;
    mobs: Set<number> = new Set();

    // Populated by the PhaserPhysicsModule
    addPhysicalComponents:(data:PhysicalComponentCreationData)=>void = () => {};

    // Populated by the PhaserPhysicsModule
    removePhysicalComponents:(entity: number)=>void = () => {};
    
    // This is initialized in TilesModule
    tiles: Entity[][];

    constructor(ecs: ECS, scene:Scene, modules: GameLogicModule[]) {
        this.scene = scene;
        this.ecs = ecs;
        modules.forEach(module => module.init(this));
    }
    
    update(delta: number) {
        this.timeFromStart += delta;
        this.ecs.update(delta);
    }
    
    getConfig<T>(key: Function): T {
        const configEntity = this.ecs.getEntitiesWithComponent(Configs)[0];
        const config = this.ecs.getComponent(configEntity, Configs)?.getConfig(key);
        if (!config) {
            throw new Error(`Config ${key} not found`);
        }
        return config as T;
    }
}
