import {EventBus, GameEvents, UiEvents} from '../EventBus';
import { Scene } from 'phaser';
import {GameLogic} from "../logic/GameLogic.ts";
import {ECS} from "../core/ECS.ts";
import {TilesModule} from "../logic/modules/TilesModule.ts";
import Tiles = TilesModule.TilesModule;
import {AutoRpgDisplay} from "../display/autorpg/AutoRpgDisplay.ts";
import {CameraModule} from "../display/autorpg/CameraModule.ts";
import {DungeonFloorDisplayModule} from "../display/autorpg/DungeonFloorDisplayModule.ts";
import {TileSelectionModule} from "../display/autorpg/TileSelectionModule.ts";
import {MobsDisplayModule} from "../display/autorpg/MobsDisplayModule.ts";
import MobsDisplay = MobsDisplayModule.MobsDisplayModule;
import {PhaserPhysicsModule} from "../logic/modules/PhaserPhysicsModule.ts";
import {MobsModule} from "../logic/modules/MobsModule.ts";
import {GOAP} from "../logic/modules/goap/GoapModule.ts";
import {FloatingNumbersDisplay} from "../display/autorpg/FloatingNumbersDisplay.ts";
import {AttackModule} from "../logic/modules/weapons/Attack.ts";
import {SteeringModule} from "../logic/modules/SteeringModule.ts";
import {TargetingModule} from "../logic/modules/Targeting.ts";
import {FrameLog} from "../logic/modules/FrameLog.ts";
import {LocomotionModule} from "../logic/modules/Locomotion.ts";
import {GoapConnectorModule} from "../logic/modules/GoapConnectorModule.ts";
import {OverwhelmModule} from "../logic/modules/OverwhelmModule.ts";
import {CorpsesDisplayModule} from "../display/autorpg/CorpsesDisplayModule.ts";
import {DeathModule} from "../logic/modules/DeathModule.ts";
import {BuildingsModule} from "../logic/modules/BuildingsModule.ts";
import {BuildingsDisplayModule} from "../display/autorpg/BuildingsDisplayModule.ts";
import {RuinsDisplayModule} from "../display/autorpg/RuinsDisplayModule.ts";

export class AutoRpg extends Scene
{
    private gameLogic: GameLogic;
    private gameDisplay: AutoRpgDisplay;
    
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
        EventBus.on(GameEvents.GameOver, this.changeScene, this);

        const ecs = new ECS();
        
        this.gameLogic = new GameLogic( ecs, this, [
            new FrameLog.FrameLogModule(),
            new Tiles(),
            new LocomotionModule(),
            new PhaserPhysicsModule.PhaserPhysicsModule(),
            new MobsModule.MobsModule(),
            new AttackModule(),
            new DeathModule(),
            new OverwhelmModule(),
            new SteeringModule(),
            new GOAP.GoapModule(),
            new GoapConnectorModule(),
            new TargetingModule(),
            new BuildingsModule()
        ]);
        
        this.gameDisplay = new AutoRpgDisplay(this, ecs, [
            new CameraModule(),
            new DungeonFloorDisplayModule(),
            new MobsDisplay(),
            new RuinsDisplayModule(),
            new BuildingsDisplayModule(),
            new CorpsesDisplayModule(),
            new TileSelectionModule(),
            new FloatingNumbersDisplay()
        ]);
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene () {
        EventBus.off(GameEvents.GameOver, this.changeScene, this);
        // this.scene.start('GameOver');
    }
}
