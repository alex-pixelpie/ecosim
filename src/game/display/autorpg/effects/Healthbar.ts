import {AutoRpgDisplay, MobData} from "../AutoRpgDisplay.ts";
import Sprite = Phaser.GameObjects.Sprite;

export class Healthbar {
    healthBar: Phaser.GameObjects.Graphics;
    maxWidth: number = 40;
    height: number = 5;
    offsetTop: number = 10;
    offsetLeft: number = 20;
    
    constructor(display: AutoRpgDisplay){
        this.healthBar = display.scene.add.graphics();
        display.mobUi.add(this.healthBar);
    }
    
    destroy(){
        this.healthBar.destroy();
    }

    update(mob: MobData, sprite:Sprite): void {
        if (!this.healthBar) {
            return;
        }
        
        const spriteTopY = sprite.y - sprite.displayHeight / 4;
        this.healthBar.clear();
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(sprite.x - this.offsetLeft, spriteTopY - this.offsetTop, this.maxWidth, this.height); // Background bar
        this.healthBar.fillStyle(0xff0000, 1);
        const healthWidth = ((mob.health as number) / (mob.maxHealth || 1)) * this.maxWidth;
        this.healthBar.fillRect(sprite.x - this.offsetLeft, spriteTopY - this.offsetTop, healthWidth, this.height); // Background bar
    }
}