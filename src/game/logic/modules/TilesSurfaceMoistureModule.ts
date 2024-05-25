import {GameLogic, GameLogicModule, ValueComponent} from "../GameLogic.ts";
import {TilesModule} from "./TilesModule.ts";
import {TilesElevationModule} from "./TilesElevationModule.ts";

export namespace TilesSurfaceMoistureModule {
    import Tile = TilesModule.Tile;
    import Elevation = TilesElevationModule.Elevation;

    export class SurfaceMoisture extends ValueComponent{}

    export class TilesSurfaceMoistureModule extends GameLogicModule {
        override init(game: GameLogic) {
            const entities = game.ecs.getEntitiesWithComponents([Tile, Elevation]);

            entities.forEach(entity => {
                const depth = game.ecs.getComponent(entity, Elevation).value - game.config.seaLevel;
                const moisture = Math.max(0, -depth * game.config.maxMoistureInTile);

                game.ecs.addComponent(entity, new SurfaceMoisture(moisture));
            });
        }
    }
}