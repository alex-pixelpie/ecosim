import {AutoRpgDisplay} from "../AutoRpgDisplay.ts";
import Sprite = Phaser.GameObjects.Sprite;

export interface GroupRingUpdateData {
    rotationToTarget?: number;
    group: number;
}

export class GroupRing {
    private ring:Sprite;
    
    constructor(display: AutoRpgDisplay, scale: number = 1){
        this.ring = display.scene.add.sprite(0, 0, "group-ring");
        this.ring.setOrigin(0.5, 0.5);
        this.ring.setScale(scale);
        display.groundUi.add(this.ring);
    }
    
    update({rotationToTarget = 0, group}: GroupRingUpdateData, sprite:Sprite): void {
        if (!this.ring) {
            return;
        }
        
        const spriteTopY = sprite.y + this.ring.displayHeight / 4;
        this.ring.setPosition(sprite.x, spriteTopY);
        this.ring.alpha = 0.5;
        this.ring.rotation = rotationToTarget + Math.PI / 2;
        this.ring.setTint(group? 0x00ff00 : 0xff0000);
    }
    
    destroy(){
        this.ring.destroy();
    }
}