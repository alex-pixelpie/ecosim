import {createNoise2D} from "simplex-noise";
import {MathUtils} from "../../utils/Math.ts";
import {GameLogic, GameLogicModule, ValueComponent} from "../GameLogic.ts";
import {TilesModule} from "./TilesModule.ts";
import Tile = TilesModule.Tile;
import {PhysicsModule} from "./PhysicsModule.ts";

const DEFAULT_NOISE_SIZE = 50;

export namespace TilesElevationModule {
    import Position = PhysicsModule.Position;

    export class Elevation extends ValueComponent{}

    export class TilesElevationModule extends GameLogicModule {
        private noise = createNoise2D();
        override init(game: GameLogic) {
            const entities = game.ecs.getEntitiesWithComponents([Tile, Position]);

            entities.forEach(entity => {
                const position = game.ecs.getComponent(entity, Position);
                game.ecs.addComponent(entity, new Elevation(Math.round(MathUtils.remapNoiseToUnit(this.noise(position.x / DEFAULT_NOISE_SIZE, position.y / DEFAULT_NOISE_SIZE)) * game.config.maxElevation)));
            });
        }
    }
}