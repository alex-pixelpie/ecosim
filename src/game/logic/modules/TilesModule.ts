import {GameLogic, GameLogicModule} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";
import {PhysicsModule} from "./PhysicsModule.ts";
import addPhysicalComponents = PhysicsModule.addPhysicalComponents;

export namespace TilesModule {

    export class Tile extends Component {}
    
    export class TilesModule extends GameLogicModule {
        override init(game: GameLogic) {
            const size = game.config.tilesInMapSide;

            for (let column = 0; column < size; column++) {
                for (let row = 0; row < size; row++) {
                    const entity = game.ecs.addEntity();
                    game.ecs.addComponent(entity, new Tile());
                    addPhysicalComponents(game.ecs, entity, {x: row, y: column});
                    game.tiles[row][column] = entity;
                }
            }
        }
    }
}