import {AutoRpgDisplay} from "../AutoRpgDisplay.ts";
import Sprite = Phaser.GameObjects.Sprite;

export interface GroupRingUpdateData {
    rotationToTarget?: number;
    group: number;
}

export class Shadow {
    private cirlce:Sprite;
    
    constructor(display: AutoRpgDisplay, scale: number = 1, isGround: boolean = false){
        this.cirlce = display.scene.add.sprite(0, 0, "circle");
        this.cirlce.setOrigin(0.5, 0.5);
        this.cirlce.setScale(scale);
        this.cirlce.setTint(0x000000);
        this.cirlce.setAlpha(0.5);
        
        const group = isGround ? display.groundShadow : display.airShadow;
        group.add(this.cirlce);
    }
    
    update(sprite:Sprite): void {
        if (!this.cirlce) {
            return;
        }
        
        const spriteTopY = sprite.y + this.cirlce.displayHeight / 4;
        this.cirlce.setPosition(sprite.x, spriteTopY);
    }
    
    destroy(){
        this.cirlce.destroy();
    }
}