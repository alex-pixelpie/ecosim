import {AutoRpgDisplay} from "../AutoRpgDisplay.ts";
import Sprite = Phaser.GameObjects.Sprite;

export interface HealthData {
    health: number;
    maxHealth: number;
}

export class Healthbar {
    healthBar: Phaser.GameObjects.Graphics;
    maxWidth: number = 40;
    height: number = 5;
    offsetTop: number = 10;
    offsetLeft: number = 20;
    onTop: boolean;
    
    constructor(display: AutoRpgDisplay, isOnTop: boolean = false){
        this.onTop = isOnTop;
        this.healthBar = display.scene.add.graphics();
        display.mobUi.add(this.healthBar);
    }
    
    destroy(){
        this.healthBar.destroy();
    }
    
    update(healthData: HealthData, sprite:Sprite): void {
        if (!this.healthBar) {
            return;
        }
        
        const spriteTopY = this.onTop ? sprite.y - sprite.displayHeight / 4 : sprite.y + sprite.displayHeight / 2 + this.offsetTop;
        this.healthBar.clear();
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(sprite.x - this.offsetLeft, spriteTopY - this.offsetTop, this.maxWidth, this.height); // Background bar
        this.healthBar.fillStyle(0xff0000, 1);
        const healthWidth = ((healthData.health as number) / (healthData.maxHealth || 1)) * this.maxWidth;
        this.healthBar.fillRect(sprite.x - this.offsetLeft, spriteTopY - this.offsetTop, healthWidth, this.height); // Background bar
    }
}