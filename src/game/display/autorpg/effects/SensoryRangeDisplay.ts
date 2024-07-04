import {AutoRpgDisplay} from "../AutoRpgDisplay.ts";
import Container = Phaser.GameObjects.Container;

export class SensoryRangeDisplay {
    private circle: Phaser.GameObjects.Graphics;

    constructor(display: AutoRpgDisplay) {
        this.circle = display.scene.add.graphics();
        display.groundUi.add(this.circle);
    }

    update(container: Container, radius: number, targetsInRange: number, isObserved:boolean): void {
        if (!this.circle) {
            return;
        }

        this.circle.clear();
        
        if (!isObserved) {
            return;
        }
        
        this.circle.lineStyle(2, targetsInRange ? 0xff0000 : 0x00ff00, 1); // Thin green line
        this.circle.strokeCircle(0, 0, radius);
        this.circle.setPosition(container.x, container.y);
    }

    destroy(): void {
        if (this.circle) {
            this.circle.destroy();
        }
    }
}