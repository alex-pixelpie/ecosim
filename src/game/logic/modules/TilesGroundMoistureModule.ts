import {GameLogic, GameLogicModule, ValueComponent} from "../GameLogic.ts";
import {TilesModule} from "./TilesModule.ts";

export namespace TilesGroundMoistureModule {
    import Tile = TilesModule.Tile;

    export class GroundMoisture extends ValueComponent{}
    
    export class TilesGroundMoistureModule extends GameLogicModule {
        override init(game: GameLogic) {
            const entities = game.ecs.getEntitiesWithComponents([Tile]);

            entities.forEach(entity => {
                const moisture = 100;

                game.ecs.addComponent(entity, new GroundMoisture(moisture));
            });
        }
    }
}