import {EventBus, GameEvents, UiEvents} from '../EventBus';
import { Scene } from 'phaser';
import {GameLogic} from "../logic/GameLogic.ts";
import {ECS} from "../core/ECS.ts";
import {TilesModule} from "../logic/modules/TilesModule.ts";
import {AutoRpgDisplay} from "../display/autorpg/AutoRpgDisplay.ts";
import {CameraModule} from "../display/autorpg/CameraModule.ts";
import {DungeonFloorDisplayModule} from "../display/autorpg/DungeonFloorDisplayModule.ts";
import {MobsDisplayModule} from "../display/autorpg/MobsDisplayModule.ts";
import MobsDisplay = MobsDisplayModule.MobsDisplayModule;
import {PhaserPhysicsModule} from "../logic/modules/PhaserPhysicsModule.ts";
import {FloatingNumbersDisplay} from "../display/autorpg/FloatingNumbersDisplay.ts";
import {AttackModule} from "../logic/modules/AttackModule.ts";
import {SteeringModule} from "../logic/modules/SteeringModule.ts";
import {LocomotionModule} from "../logic/modules/LocomotionModule.ts";
import {OverwhelmModule} from "../logic/modules/OverwhelmModule.ts";
import {CorpsesDisplayModule} from "../display/autorpg/CorpsesDisplayModule.ts";
import {DeathModule} from "../logic/modules/DeathModule.ts";
import {BuildingsModule} from "../logic/modules/BuildingsModule.ts";
import {BuildingsDisplayModule} from "../display/autorpg/BuildingsDisplayModule.ts";
import {RuinsDisplayModule} from "../display/autorpg/RuinsDisplayModule.ts";
import {GameOverDisplayModule} from "../display/autorpg/GameOverDisplayModule.ts";
import {GameOverModule} from "../logic/modules/GameOverModule.ts";
import {FrameLogModule} from "../logic/modules/FrameLogModule.ts";
import {TargetingModule} from "../logic/modules/TargetingModule.ts";
import {MobsModule} from "../logic/modules/MobsModule.ts";
import {SensoryModule} from "../logic/modules/SensoryModule.ts";
import {CoinsDisplayModule} from "../display/autorpg/CoinsDisplayModule.ts";
import {LootModule} from "../logic/modules/LootModule.ts";
import {TestGameModule} from "../logic/modules/TestGameModule.ts";
import {UtilityBehaviorModule} from "../logic/modules/utility-behavior/UtilityBehaviorModule.ts";
import {Configs} from "../configs/Configs.ts";

export class AutoRpg extends Scene
{
    private gameLogic: GameLogic;
    private gameDisplay: AutoRpgDisplay;
    
    constructor () {
        super('AutoRpg');
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        const timeScale = Configs.sessionConfig.speed;
        this.updateTimeScale(timeScale);
        
        const secondsDelta = timeScale ? ((delta / 1000) / timeScale) : 0;
        
        this.gameLogic.update(secondsDelta);
        this.gameDisplay.update(secondsDelta);
        
        EventBus.emit(UiEvents.GameUpdate, this);
    }

    create () {
        EventBus.on(GameEvents.GameStart, this.changeScene, this);

        const ecs = new ECS();
        
        this.gameLogic = new GameLogic( ecs, this, [
            new FrameLogModule(),
            new TilesModule(),
            new LocomotionModule(),
            new PhaserPhysicsModule(),
            new DeathModule(),
            new MobsModule(),
            new AttackModule(),
            new OverwhelmModule(),
            new SteeringModule(),
            new SensoryModule(),
            new UtilityBehaviorModule(),
            new TargetingModule(),
            new BuildingsModule(),
            new LootModule(),
            new TestGameModule(),
            new GameOverModule()
        ]);
        
        this.gameDisplay = new AutoRpgDisplay(this, ecs, [
            new CameraModule(),
            new DungeonFloorDisplayModule(),
            new MobsDisplay(),
            new RuinsDisplayModule(),
            new BuildingsDisplayModule(),
            new CorpsesDisplayModule(),
            new CoinsDisplayModule(),
            new FloatingNumbersDisplay(),
            new GameOverDisplayModule()
        ]);

        const gd = this.gameDisplay;
        
        this.events.once('destroy', function () {
            gd.destroy();
        }, this);
    
        EventBus.emit('current-scene-ready', this);

        // EventBus.emit(GameEvents.GameOver, {victory: true});
    }
    
    changeScene () {
        EventBus.off(GameEvents.GameStart, this.changeScene, this);
        this.scene.start('AutoRpg');
    }

    private updateTimeScale(timeScale: number) {
        if (timeScale == 0){
            this.tweens.pauseAll();
            this.physics.pause();
            this.anims.pauseAll();
        } else {

            this.tweens.resumeAll();
            this.physics.resume();
            this.anims.resumeAll();

            this.tweens.timeScale = timeScale;
            this.physics.world.timeScale = timeScale;
            this.time.timeScale = timeScale;
        }
    }
}
