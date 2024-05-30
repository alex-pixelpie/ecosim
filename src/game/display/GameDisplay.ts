import {ECS} from "../core/ECS.ts";
import {TilesModule} from "../logic/modules/TilesModule.ts";
import {TilesGroundMoistureModule} from "../logic/modules/TilesGroundMoistureModule.ts";
import {TilesSurfaceMoistureModule} from "../logic/modules/TilesSurfaceMoistureModule.ts";
import {TilesElevationModule} from "../logic/modules/TilesElevationModule.ts";
import {CloudCoverModule} from "../logic/modules/CloudCoverModule.ts";
import {MapDisplay} from "./MapDisplay.ts";
import Tile = TilesModule.Tile;
import {BiochemistryModule} from "../logic/modules/BiochemistryModule.ts";
import BiochemicalBalance = BiochemistryModule.BiochemicalBalance;
import {PlantsModule} from "../logic/modules/PlantsModule.ts";
import PlantBody = PlantsModule.PlantBody;
import BiologicalAge = BiochemistryModule.BiologicalAge;
import ChemicalElement = BiochemistryModule.ChemicalElement;
import Death = BiochemistryModule.Death;
import {PhysicsModule} from "../logic/modules/PhysicsModule.ts";
import Position = PhysicsModule.Position;

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

export class PlantDisplayData {
    public position: {x: number, y: number};
    public type: string;
    public age: number| string;
    public maxAge: number | string;
    public vitality: string;
    public glucoseAvailable: number| string;
    public radius: number| string;
    public id: number| string;
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
    plants: PlantDisplayData[] = [];
    
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
        this.updatePlants();
        
        this.modules.forEach(module => module.update(delta));
    }
    
    private updateTiles(){
        const entities = this.ecs.getEntitiesWithComponent(Tile);
        
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
    
    private updatePlants(){
        const entities = this.ecs.getEntitiesWithComponent(PlantBody);
        
        this.plants = entities.map(entity => {
            const position = this.ecs.getComponent(entity, Position);
            const plant = this.ecs.getComponent(entity, PlantBody);
            const worldPosition = this.mapDisplay.map.tileToWorldXY(position.x / 10, position.y / 10)!;
            
            return {
                age: Math.floor(this.ecs.getComponent(entity, BiologicalAge).value),
                glucoseAvailable: Math.floor(this.ecs.getComponent(entity, BiochemicalBalance).balance[ChemicalElement.Glucose] || 0),
                vitality: this.ecs.getComponent(entity, Death) ? 'Dead' : 'Alive',
                maxAge: plant.config.maxAge == Number.MAX_VALUE ? '∞' : Math.floor(plant.config.maxAge),
                position: worldPosition,
                type: plant.config.type.toString(),
                radius: (plant.radiiByHeight?.[0] || 0).toFixed(2),
                id: entity
            };
        });
    }
}
