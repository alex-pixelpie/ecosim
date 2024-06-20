import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "./AutoRpgDisplay.ts";

class RuinView {
    sprite: Phaser.GameObjects.Sprite;
    constructor(public display: AutoRpgDisplay, public x: number, public y: number, public type: string) {
        this.sprite = display.scene.add.sprite(x, y, type);
        this.sprite.setFrame(4);
        display.corpsesLayer.add(this.sprite);
    }

    destroy(): void {
        this.sprite.destroy();
    }
}

enum RuinKeys {
    Base = "castle"
}

export class RuinsDisplayModule extends DisplayModule<AutoRpgDisplay> {
    private display: AutoRpgDisplay;
    private ruins = new Map<number, RuinView>();
    
    public init(display: AutoRpgDisplay): void {
        this.display = display;
    }

    public update(_: number): void {
        this.ruins.forEach((view, entity) => {
            if (!this.display.ruins.find(data => data.id === entity)) {
                view.destroy();
                this.ruins.delete(entity);
            }
        });
        
        this.display.ruins.forEach(ruin => {
            let view = this.ruins.get(ruin.id);
            if (!view) {
                view = new RuinView(this.display, ruin.x, ruin.y, RuinKeys[ruin.subtype  as any as keyof typeof RuinKeys]);
                this.ruins.set(ruin.id, view);
            }
        });
    }
}