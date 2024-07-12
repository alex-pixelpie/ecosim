import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "./AutoRpgDisplay.ts";
import Vector2 = Phaser.Math.Vector2;
import {MapDisplay} from "../MapDisplay.ts";
import {EventBus, GameEvents} from "../../EventBus.ts";

export class RightClickEmittingModule extends DisplayModule<AutoRpgDisplay> {
    display: AutoRpgDisplay;
    private scene: Phaser.Scene;
    private mapDisplay: MapDisplay;
    
    public init(display: AutoRpgDisplay): void {
        this.display = display;
        this.scene = display.scene;
        this.mapDisplay = display.mapDisplay;
    }
    public update(delta: number): void {
        if (this.scene.input.manager.activePointer.rightButtonDown()){
            const worldPoint = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main) as Vector2;
            const map = this.mapDisplay.map;

            // Rounds down to nearest tile
            const pointerTileX = map.worldToTileX(worldPoint.x) || 0;
            const pointerTileY = map.worldToTileY(worldPoint.y) || 0;
            const isPointerInBounds = pointerTileX >= 0 && pointerTileX < map.width && pointerTileY >= 0 && pointerTileY < map.height;
            
            if (isPointerInBounds){
                EventBus.emit(GameEvents.RightClick, worldPoint);
            }
        }
    }
    public destroy(): void {
    }
}