import {Scene} from "phaser";
import {GameLogic} from "../logic/GameLogic.ts";
import {AutoRpgDisplay} from "../display/autorpg/AutoRpgDisplay.ts";
import {EventBus, GameEvents, UiEvents} from "../EventBus.ts";
import {ECS} from "../core/ECS.ts";
import {FrameLogModule} from "../logic/modules/FrameLogModule.ts";
import {CameraModule} from "../display/autorpg/CameraModule.ts";
import {DungeonFloorDisplayModule} from "../display/autorpg/DungeonFloorDisplayModule.ts";
import {TilesModule} from "../logic/modules/TilesModule.ts";
import {TowerPlacementModule} from "../display/tools-modules/TowerPlacementModule.ts";

export class SpawnChanceConfigScene extends Scene {

    private gameLogic: GameLogic;
    private gameDisplay: AutoRpgDisplay;

    constructor () {
        super('SpawnChanceConfigScene');
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        const secondsDelta = delta / 1000;
        this.gameLogic.update(secondsDelta);
        this.gameDisplay.update(secondsDelta);

        EventBus.emit(UiEvents.GameUpdate, this);
    }

    create () {
        this.input.mouse!.disableContextMenu(); 

        EventBus.on(GameEvents.GameStart, this.changeScene, this);

        const ecs = new ECS();

        this.gameLogic = new GameLogic( ecs, this, [
            new FrameLogModule(),
            new TilesModule(),
        ]);

        this.gameDisplay = new AutoRpgDisplay(this, ecs, [
            new CameraModule(),
            new DungeonFloorDisplayModule(),
            new TowerPlacementModule(),
        ]);

        EventBus.emit('current-scene-ready', this);
    }

    changeScene () {
        EventBus.off(GameEvents.GameStart, this.changeScene, this);
        this.scene.start('SpawnChanceConfigScene');
    }
}
