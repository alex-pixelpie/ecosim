import {GameLogic, GameLogicModule} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";

export namespace TilesModule {
    export class Position extends Component {
        constructor(public x: number,
                    public y: number){
            super();
        }
    }
    
    export class Tile extends Component {}
    
    export class TilesModule extends GameLogicModule {
        override init(game: GameLogic) {
            const size = game.config.mapSize;

            for (let column = 0; column < size; column++) {
                for (let row = 0; row < size; row++) {
                    const entity = game.ecs.addEntity();
                    game.ecs.addComponent(entity, new Tile());
                    game.ecs.addComponent(entity, new Position(row, column));
                }
            }
        }
    }

}