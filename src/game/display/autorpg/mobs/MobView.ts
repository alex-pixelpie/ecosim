import {AutoRpgDisplay, MobData} from "../AutoRpgDisplay.ts";

export abstract class MobView {
    sprite: Phaser.GameObjects.Sprite;
    
    public constructor(public display: AutoRpgDisplay, public id: number, x: number = 0, y: number = 0) {
        this.init(x, y);
    }

    protected abstract init(x: number, y: number): void;
    
    abstract update(mob: MobData, display: AutoRpgDisplay): void;

    abstract destroy(): void;
}
    