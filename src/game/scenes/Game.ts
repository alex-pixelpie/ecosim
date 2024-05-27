import {EventBus, UiEvents} from '../EventBus';
import { Scene } from 'phaser';
import {GameLogic} from "../logic/GameLogic.ts";
import {ECS} from "../core/ECS.ts";
import {TilesModule} from "../logic/modules/TilesModule.ts";
import Tiles = TilesModule.TilesModule;
import {TilesElevationModule} from "../logic/modules/TilesElevationModule.ts";
import Elevation = TilesElevationModule.TilesElevationModule;
import {TilesSurfaceMoistureModule} from "../logic/modules/TilesSurfaceMoistureModule.ts";
import SurfaceMoisture = TilesSurfaceMoistureModule.TilesSurfaceMoistureModule;
import {TilesGroundMoistureModule} from "../logic/modules/TilesGroundMoistureModule.ts";
import GroundMoisture = TilesGroundMoistureModule.TilesGroundMoistureModule;
import {CloudCoverModule} from "../logic/modules/CloudCoverModule.ts";
import CloudCover = CloudCoverModule.TilesCloudCoverModule;
import {GameDisplay} from "../display/GameDisplay.ts";
import {GroundMoistureLayerDisplayModule} from "../display/modules/GroundMoistureLayerDisplayModule.ts";
import {CloudCoverDisplayModule} from "../display/modules/CloudCoverDisplayModule.ts";
import {CameraModule} from "../display/modules/CameraModule.ts";
import {TileSurfaceMoistureDisplayModule} from "../display/modules/TileSurfaceMoistureDisplayModule.ts";
import {TileSelectionModule} from "../display/modules/TileSelectionModule.ts";
import {BiochemistryModule} from "../logic/modules/BiochemistryModule.ts";
import Biochemistry = BiochemistryModule.BiochemistryModule;

export class Game extends Scene
{
    private gameLogic: GameLogic;
    private gameDisplay: GameDisplay;
    
    constructor () {
        super('Game');
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        const secondsDelta = delta / 1000;
        this.gameLogic.update(secondsDelta);
        this.gameDisplay.update(secondsDelta);

        EventBus.emit(UiEvents.GameUpdate, this);
    }

    create () {
        const ecs = new ECS();
        
        this.gameLogic = new GameLogic( ecs, [
            new Tiles(), 
            new Elevation(), 
            new SurfaceMoisture(), 
            new GroundMoisture(), 
            new Biochemistry(),
            new CloudCover()
        ]);
        
        this.gameDisplay = new GameDisplay(this, ecs, [
            new CameraModule(), 
            new GroundMoistureLayerDisplayModule(), 
            new TileSurfaceMoistureDisplayModule(),
            new CloudCoverDisplayModule(),
            new TileSelectionModule()
        ]);
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene () {
        this.scene.start('GameOver');
    }
}
