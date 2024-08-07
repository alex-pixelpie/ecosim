import {GameLogic} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {MapPosition, Position} from "./PhaserPhysicsModule.ts";
import {Configs} from "../../configs/Configs.ts";
import {Observable, Observed} from "./SensoryModule.ts";
import {createNoise2D} from "simplex-noise";
import {MathUtils} from "../../utils/Math.ts";

const noiseScale = 0.025;

export class Tile extends Component {}

export class ChanceOfSpawn extends Component {
    constructor(public value: number) {
        super();
    }
}

export class TilesModule extends GameLogicModule {
    override init(game: GameLogic) {
        const size = Configs.mapConfig.tilesInMapSide;
        const tileSize = Configs.mapConfig.tileSize;
        const noise = createNoise2D();
        
        game.tiles = Array.from({length: size}, () => Array.from({length: size}, () => 0));
        
        for (let column = 0; column < size; column++) {
            for (let row = 0; row < size; row++) {
                const entity = game.ecs.addEntity();
                game.ecs.addComponent(entity, new Tile());
                game.ecs.addComponent(entity, new MapPosition(row, column));
                game.ecs.addComponent(entity, new Position(row * tileSize, column * tileSize));
                game.ecs.addComponent(entity, new Observable());
                game.ecs.addComponent(entity, new ChanceOfSpawn(MathUtils.remapNoiseToUnit(noise(row * noiseScale, column * noiseScale))));
                
                const observed = new Observed();
                observed.forgetImmediately = true;
                game.ecs.addComponent(entity, observed);
                
                game.tiles[row][column] = entity;
            }
        }
    }
}