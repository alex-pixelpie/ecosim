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
import {EcoSimDisplay} from "../display/ecosim/EcoSimDisplay.ts";
import {GroundMoistureLayerDisplayModule} from "../display/ecosim/GroundMoistureLayerDisplayModule.ts";
import {CloudCoverDisplayModule} from "../display/ecosim/CloudCoverDisplayModule.ts";
import {CameraModule} from "../display/ecosim/CameraModule.ts";
import {TileSurfaceMoistureDisplayModule} from "../display/ecosim/TileSurfaceMoistureDisplayModule.ts";
import {TileSelectionModule} from "../display/ecosim/TileSelectionModule.ts";
import {BiochemistryModule} from "../logic/modules/BiochemistryModule.ts";
import Biochemistry = BiochemistryModule.BiochemistryModule;
import {PlantsModule} from "../logic/modules/PlantsModule.ts";
import Plants = PlantsModule.PlantsModule;
import {PlantsDisplayModule} from "../display/ecosim/PlantsDisplayModule.ts";
import PlantsDisplay = PlantsDisplayModule.PlantsDisplayModule;
import {PhysicsModule} from "../logic/modules/PhysicsModule.ts";
import Physics = PhysicsModule.PhysicsModule;

export class EcoSim extends Scene
{
    private gameLogic: GameLogic;
    private gameDisplay: EcoSimDisplay;
    
    constructor () {
        super('EcoSim');
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
        
        this.gameLogic = new GameLogic( ecs, this,[
            new Physics(),
            new Tiles(),
            new Biochemistry(),
            new Elevation(), 
            new SurfaceMoisture(), 
            new GroundMoisture(),
            new Plants(),
            new CloudCover()
        ]);
        
        this.gameDisplay = new EcoSimDisplay(this, ecs, [
            new CameraModule(), 
            new GroundMoistureLayerDisplayModule(),
            new PlantsDisplay(),
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
