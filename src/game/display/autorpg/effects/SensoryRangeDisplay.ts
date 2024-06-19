import {AutoRpgDisplay} from "../AutoRpgDisplay.ts";

export class SensoryRangeDisplay {
    private circle: Phaser.GameObjects.Graphics;

    constructor(display: AutoRpgDisplay) {
        this.circle = display.scene.add.graphics();
        display.groundUi.add(this.circle);
    }

    update(sprite: Phaser.GameObjects.Sprite, radius: number, targetsInRange: number): void {
        if (!this.circle) {
            return;
        }

        this.circle.clear();
        this.circle.lineStyle(2, targetsInRange ? 0xff0000 : 0x00ff00, 1); // Thin green line
        this.circle.strokeCircle(0, 0, radius);
        this.circle.setPosition(sprite.x, sprite.y);
    }

    destroy(): void {
        if (this.circle) {
            this.circle.destroy();
        }
    }
}