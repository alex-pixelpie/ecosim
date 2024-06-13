import {GameLogic, GameLogicModule} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";
import {Position} from "./PhaserPhysicsModule.ts";

export class Tile extends Component {}

export class TilesModule extends GameLogicModule {
    override init(game: GameLogic) {
        const size = game.config.tilesInMapSide;

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