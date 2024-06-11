import {AutoRpgDisplay, MobData} from "../AutoRpgDisplay.ts";
import Sprite = Phaser.GameObjects.Sprite;

export class GroupRing {
    private ring:Sprite;
    
    constructor(display: AutoRpgDisplay){
        this.ring = display.scene.add.sprite(0, 0, "group-ring");
        this.ring.setOrigin(0.5, 0.5);
        display.groundUi.add(this.ring);
    }
    
    update(mob: MobData, sprite:Sprite): void {
        if (!this.ring) {
            return;
        }
        
        const spriteTopY = sprite.y + this.ring.displayHeight / 4;
        this.ring.setPosition(sprite.x, spriteTopY);
        this.ring.alpha = 0.5;
        this.ring.rotation = mob.rotationToTarget + Math.PI / 2;
        this.ring.setTint(mob.group? 0x00ff00 : 0xff0000);
    }
    
    destroy(){
        this.ring.destroy();
    }
}