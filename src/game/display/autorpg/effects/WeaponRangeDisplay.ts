import {AutoRpgDisplay} from "../AutoRpgDisplay.ts";

export class WeaponRangeDisplay {
    private minRange: Phaser.GameObjects.Graphics;
    private maxRange: Phaser.GameObjects.Graphics;

    constructor(display: AutoRpgDisplay) {
        this.minRange = display.scene.add.graphics();
        this.maxRange = display.scene.add.graphics();
        display.groundUi.add(this.minRange);
        display.groundUi.add(this.maxRange);
    }

    update(sprite: Phaser.GameObjects.Sprite, minRange: number, maxRange: number): void {
        if (!this.minRange || !this.maxRange) {
            return;
        }

        // Clear previous drawings
        this.minRange.clear();
        this.maxRange.clear();

        // Set line style for both circles
        this.minRange.lineStyle(2, 0xffff00, 1); // Thin yellow line for min range
        this.maxRange.lineStyle(2, 0xffff00, 1); // Thin yellow line for max range

        const x = sprite.x - 3;
        const y = sprite.y + 15;
        // Draw circles at the sprite's position
        this.minRange.strokeCircle(x, y, minRange);
        this.maxRange.strokeCircle(x,  y, maxRange);    
    }

    destroy(): void {
        if (this.minRange) {
            this.minRange.destroy();
        }

        if (this.maxRange) {
            this.maxRange.destroy();
        }
    }
}