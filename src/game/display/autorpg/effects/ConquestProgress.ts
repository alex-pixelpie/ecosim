import {AutoRpgDisplay} from "../AutoRpgDisplay.ts";
import Container = Phaser.GameObjects.Container;
import Sprite = Phaser.GameObjects.Sprite;

export interface ConquestData {
    conqueredFactor: number;
    isObserved: boolean;
}

export class ConquestProgress {
    bar: Phaser.GameObjects.Graphics;
    maxWidth: number = 100;
    height: number = 5;
    offsetBottom: number = 20; // Distance from the bottom of the sprite
    onTop: boolean;
    fillColor:number = 0xffff00;
    
    constructor(display: AutoRpgDisplay, isOnTop: boolean = false) {
        this.onTop = isOnTop;
        this.bar = display.scene.add.graphics();
        display.mobUi.add(this.bar);
    }

    destroy() {
        this.bar.destroy();
    }

    update(data: ConquestData, container: Container | Sprite): void {
        if (!this.bar) {
            return;
        }
        
        if (!data.isObserved || !data.conqueredFactor) {
            this.bar.clear();
            return;
        }
        
        const spriteBottomY = this.onTop ? container.y - container.displayHeight / 2 + this.offsetBottom : container.y + container.displayHeight / 2 + this.offsetBottom;
        const healthBarX = container.x - this.maxWidth / 2;

        this.bar.clear();
        this.bar.fillStyle(0x000000, 0.5);
        this.bar.fillRect(healthBarX, spriteBottomY, this.maxWidth, this.height); // Background bar
        this.bar.fillStyle(this.fillColor, 1);
        const healthWidth = data.conqueredFactor * this.maxWidth;
        this.bar.fillRect(healthBarX, spriteBottomY, healthWidth, this.height); // Foreground bar
    }
}