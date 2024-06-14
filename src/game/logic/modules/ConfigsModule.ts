import {GameLogic} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";

export class Configs extends Component {
    private configs: Map<Function, any> = new Map();
    
    public addConfig<T>(key: Function, config: T): void {
        this.configs.set(key, config);
    }
    
    getConfig<T>(key: Function): T {
        const t = this.configs.get(key);
        
        if (!t) {
            throw new Error(`Config ${key} not found`);
        }
        
        return t as T;
    }
}

export class MapConfig {
    tilesInMapSide: number;
    tileSize: number;
    public get pixelsSize(): number {
        return this.tilesInMapSide * this.tileSize;
    }
}

export class ConfigsModule extends GameLogicModule {
    public init(game: GameLogic): void {
        
        const mapConfig = new MapConfig();
        mapConfig.tilesInMapSide = 64;
        mapConfig.tileSize = 32;

        const configs = new Configs();
        configs.addConfig(MapConfig, mapConfig);
        
        const configsEntity = game.ecs.addEntity();
        game.ecs.addComponent(configsEntity, configs);
    }
}