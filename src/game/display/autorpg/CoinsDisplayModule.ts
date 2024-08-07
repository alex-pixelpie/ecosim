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
            if (!this.display.loot.find(data => data.id === entity)) {
                view.destroy();
                this.coins.delete(entity);
            }
        });
        
        this.display.loot.forEach(coin => {
            let view = this.coins.get(coin.id);
            if (!view) {
                view = new CoinView(this.display, coin.id, coin.x, coin.y, coin.subtype);
                view.sprite.play("coin", true);
                const frames = view.sprite.anims.currentAnim!.frames;
                const randomFrameIndex = Math.round(Math.random() * (frames.length-1));
                const frame = frames[randomFrameIndex];
                view.sprite.anims.setCurrentFrame(frame);
                this.coins.set(coin.id, view);
            }
            
            view.sprite.alpha = coin.isObserved ? 1 : 0;
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

    public destroy(): void {
        this.coins.forEach(view => view.destroy());
    }
}