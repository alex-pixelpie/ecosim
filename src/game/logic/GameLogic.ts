import {Component, ECS, Entity, System} from "../core/ECS.ts";
import {Scene} from "phaser";

const MAX_MOISTURE_IN_TILE = 1000;
const SEA_LEVEL = 2;
const MAP_SIZE = 64;

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

export abstract class GameLogicModule {
    public abstract init(game: GameLogic): void;
}

export abstract class ValueComponent extends Component {
    public constructor(public value: number) {
        super();
    }
}

export abstract class ClampedValueComponent {
    private _value: number;
    public unclampedValue: number;
    
    public get value() {
        return this._value;
    }
    
    public set value(value: number) {
        this._value = Math.max(this.min, Math.min(this.max, value));
        this.unclampedValue = value;
    }
    
    public constructor(value: number, public min: number = Number.MIN_VALUE, public max: number = Number.MAX_VALUE) {
        this._value = value;
        this.unclampedValue = value;
    }
}

export type EcoSimLogicConfig = {
    tilesInMapSide: number,
    maxMoistureInTile: number,
    seaLevel: number,
    maxElevation: number,
    tileSize: number,
    biologicalDecayRatePerSecond: number,
    plants: any
}

export class GameLogic {
    ecs: ECS;
    scene: Phaser.Scene;
    timeFromStart: number = 0;
    config : EcoSimLogicConfig = {
        tilesInMapSide: MAP_SIZE,
        maxMoistureInTile: MAX_MOISTURE_IN_TILE,
        seaLevel: SEA_LEVEL,
        maxElevation: 5,
        tileSize: 10,
        biologicalDecayRatePerSecond : 1,
        plants: {}
    };
    mobs: Set<number> = new Set();

    // Populated by the PhaserPhysicsModule
    addPhysicalComponents:(entity: number, x: number, y: number, radius:number)=>void = () => {};

    // Populated by the PhaserPhysicsModule
    removePhysicalComponents:(entity: number)=>void = () => {};
    
    // @ts-ignore - this is initialized in tiles system
    tiles: Entity[][] = Array.from({length: MAP_SIZE}, () => Array.from({length: MAP_SIZE}, () => null));
    
    get mapSize() {
        return this.config.tilesInMapSide * this.config.tileSize;
    }
    
    constructor(ecs: ECS, scene:Scene, modules: GameLogicModule[]) {
        this.scene = scene;
        this.ecs = ecs;
        modules.forEach(module => module.init(this));
    }
    
    update(delta: number) {
        this.timeFromStart += delta;
        this.ecs.update(delta);
    }

    mapPositionToTile(position: {x:number, y:number}): Entity | null{
        const x = Math.floor(position.x / this.config.tileSize);
        const y = Math.floor(position.y / this.config.tileSize);
        
        if (x < 0 || x >= this.mapSize || y < 0 || y >= this.mapSize) {
            return null;
        }
        
        return this.tiles[x][y];
    }
}
