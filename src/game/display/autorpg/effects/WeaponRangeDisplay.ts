import {AutoRpgDisplay} from "../AutoRpgDisplay.ts";
import Container = Phaser.GameObjects.Container;

export class WeaponRangeDisplay {
    private minRange: Phaser.GameObjects.Graphics;
    private maxRange: Phaser.GameObjects.Graphics;

    constructor(display: AutoRpgDisplay) {
        this.minRange = display.scene.add.graphics();
        this.maxRange = display.scene.add.graphics();
        display.groundUi.add(this.minRange);
        display.groundUi.add(this.maxRange);
    }

    update(container: Container, minRange: number, maxRange: number, isObserved:boolean): void {
        if (!this.minRange || !this.maxRange) {
            return;
        }

        // Clear previous drawings
        this.minRange.clear();
        this.maxRange.clear();

        if (!isObserved) {
            return;
        }
        
        // Set line style for both circles
        this.minRange.lineStyle(2, 0xffff00, 1); // Thin yellow line for min range
        this.maxRange.lineStyle(2, 0xffff00, 1); // Thin yellow line for max range

        const x = container.x - 3;
        const y = container.y + 15;
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