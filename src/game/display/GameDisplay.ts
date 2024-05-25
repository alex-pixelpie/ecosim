import {ECS} from "../core/ECS.ts";
import {TilesModule} from "../logic/modules/TilesModule.ts";
import Position = TilesModule.Position;
import {TilesGroundMoistureModule} from "../logic/modules/TilesGroundMoistureModule.ts";
import {TilesSurfaceMoistureModule} from "../logic/modules/TilesSurfaceMoistureModule.ts";
import {TilesElevationModule} from "../logic/modules/TilesElevationModule.ts";
import {CloudCoverModule} from "../logic/modules/CloudCoverModule.ts";
import {MapDisplay} from "./MapDisplay.ts";

const MAP_SIZE = 120;

export abstract class DisplayModule {
    public abstract init(display: GameDisplay): void;
    public abstract update(delta: number): void;
}

export class TileDisplayData {
    public groundMoisture: string|number;
    public surfaceMoisture: string|number;
    public elevation: string|number;
    public cloudCover: string|number;
    public position: {x: number, y: number};
}

const WHITE_TILE : number = 8;

export class GameDisplayConfig {
    whiteTile: number = WHITE_TILE;
    maxMoistureInTile: number = 1000;
}

export class GameDisplay {
    mapDisplay: MapDisplay;
    modules: DisplayModule[];
    scene: Phaser.Scene;
    ecs: ECS;
    tiles: TileDisplayData[][];
    config:GameDisplayConfig  = new GameDisplayConfig();
    constructor(scene: Phaser.Scene, ecs:ECS, modules: DisplayModule[]) {
        this.ecs = ecs;
        this.scene = scene;
        this.modules = modules;
        this.mapDisplay = new MapDisplay(scene, MAP_SIZE);
        this.tiles = Array.from({length: MAP_SIZE}, () => Array.from({length: MAP_SIZE}, () => new TileDisplayData()));
        
        this.modules.forEach(module => module.init(this));
    }
 
    update(delta: number) {
        this.updateTiles();
        this.modules.forEach(module => module.update(delta));
    }
    
    private updateTiles(){
        const entities = this.ecs.getEntitiesWithComponent(Position);
        entities.forEach(entity => {
            const position = this.ecs.getComponent(entity, Position);
            
            this.tiles[position.x][position.y] = {
                groundMoisture: this.ecs.getComponent(entity, TilesGroundMoistureModule.GroundMoisture)?.value || 0,
                surfaceMoisture: this.ecs.getComponent(entity, TilesSurfaceMoistureModule.SurfaceMoisture)?.value || 0 / this.config.maxMoistureInTile,
                elevation: this.ecs.getComponent(entity, TilesElevationModule.Elevation)?.value || 0,
                cloudCover: this.ecs.getComponent(entity, CloudCoverModule.CloudCover)?.value.toFixed(2) || 0,
                position: {x: position.x, y: position.y}
            };
        });
    }
}
