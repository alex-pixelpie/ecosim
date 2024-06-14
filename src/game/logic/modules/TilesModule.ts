import {GameLogic} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import { MapConfig } from "../../configs/MapConfig.ts";
import {Configs} from "../../configs/Configs.ts";

export class Tile extends Component {}

export class TilesModule extends GameLogicModule {
    override init(game: GameLogic) {
        const size = Configs.mapConfig.tilesInMapSide;
        
        game.tiles = Array.from({length: size}, () => Array.from({length: size}, () => 0));
        
        for (let column = 0; column < size; column++) {
            for (let row = 0; row < size; row++) {
                const entity = game.ecs.addEntity();
                game.ecs.addComponent(entity, new Tile());
                game.ecs.addComponent(entity, new Position(row, column));
                game.tiles[row][column] = entity;
            }
        }
    }
}