import {AutoRpgDisplay} from "../AutoRpgDisplay.ts";

export class SensoryRangeDisplay {
    private circle: Phaser.GameObjects.Graphics;

    constructor(display: AutoRpgDisplay) {
        this.circle = display.scene.add.graphics();
        this.circle.lineStyle(2, 0x00ff00, 1); // Thin green line
    }

    update(sprite: Phaser.GameObjects.Sprite, radius: number): void {
        if (!this.circle) {
            return;
        }

        this.circle.clear();
        this.circle.strokeCircle(0, 0, radius); // Draw circle at (0,0) with specified radius
        this.circle.setPosition(sprite.x, sprite.y);
    }

    destroy(): void {
        if (this.circle) {
            this.circle.destroy();
        }
    }
}