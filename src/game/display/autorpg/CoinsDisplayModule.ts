import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "./AutoRpgDisplay.ts";

class CoinView {
    sprite: Phaser.GameObjects.Sprite;
    
    constructor(public display: AutoRpgDisplay, public id:number, public x: number, public y: number, public type: string) {
        this.sprite = display.scene.add.sprite(x, y, type);
        display.groundUi.add(this.sprite);
    }

    destroy(): void {
        this.sprite.destroy();
    }
}

export class CoinsDisplayModule extends DisplayModule<AutoRpgDisplay> {
    private display: AutoRpgDisplay;
    private coins = new Map<number, CoinView>();
    
    public init(display: AutoRpgDisplay): void {
        this.display = display;
        this.InitAnimations();
    }

    public update(_: number): void {
        this.coins.forEach((view, entity) => {
            if (!this.display.coins.find(data => data.id === entity)) {
                view.destroy();
                this.coins.delete(entity);
            }
        });
        
        this.display.coins.forEach(coin => {
            let view = this.coins.get(coin.id);
            if (!view) {
                view = new CoinView(this.display, coin.id, coin.x, coin.y, coin.subtype);
                view.sprite.play("coin", true);
                this.coins.set(coin.id, view);
            }
        });
    }

    private InitAnimations() {
        const scene = this.display.scene;

        scene.anims.create({
            key: "coin",
            frames: scene.anims.generateFrameNumbers("coin", {start: 0, end: 7}),
            frameRate: 12,
            repeat: -1
        });
    }
}