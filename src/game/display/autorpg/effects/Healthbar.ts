import {AutoRpgDisplay} from "../AutoRpgDisplay.ts";
import Container = Phaser.GameObjects.Container;
import Sprite = Phaser.GameObjects.Sprite;

export interface HealthData {
    health: number;
    maxHealth: number;
}
export class Healthbar {
    healthBar: Phaser.GameObjects.Graphics;
    maxWidth: number;
    height: number = 5;
    offsetBottom: number = 10; // Distance from the bottom of the sprite
    onTop: boolean;

    constructor(display: AutoRpgDisplay, isOnTop: boolean = false) {
        this.onTop = isOnTop;
        this.healthBar = display.scene.add.graphics();
        display.mobUi.add(this.healthBar);
    }

    destroy() {
        this.healthBar.destroy();
    }

    update(healthData: HealthData, container: Container | Sprite): void {
        if (!this.healthBar) {
            return;
        }

        this.maxWidth = this.calculateWidth(healthData.maxHealth);
        const spriteBottomY = this.onTop ? container.y - container.displayHeight / 2 + this.offsetBottom : container.y + container.displayHeight / 2 + this.offsetBottom;
        const healthBarX = container.x - this.maxWidth / 2;

        this.healthBar.clear();
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(healthBarX, spriteBottomY, this.maxWidth, this.height); // Background bar
        this.healthBar.fillStyle(0xff0000, 1);
        const healthWidth = ((healthData.health as number) / (healthData.maxHealth || 1)) * this.maxWidth;
        this.healthBar.fillRect(healthBarX, spriteBottomY, healthWidth, this.height); // Foreground bar
    }

    calculateWidth(maxHealth: number): number {
        const minHealth = 50;
        const maxHealthRange = 1000;
        const minWidth = 10;
        const maxWidth = 200;
        if (maxHealth <= minHealth) {
            return minWidth;
        }
        if (maxHealth >= maxHealthRange) {
            return maxWidth;
        }
        const logMin = Math.log(minHealth);
        const logMax = Math.log(maxHealthRange);
        const logCurrent = Math.log(maxHealth);
        const scale = (logCurrent - logMin) / (logMax - logMin);
        return minWidth + scale * (maxWidth - minWidth);
    }
}