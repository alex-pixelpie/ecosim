import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "./AutoRpgDisplay.ts";

class CorpseView {
    sprite: Phaser.GameObjects.Sprite;
    constructor(public display: AutoRpgDisplay, public x: number, public y: number, public type: string) {
        this.sprite = display.scene.add.sprite(x, y, type);
        display.corpsesLayer.add(this.sprite);
    }

    destroy(): void {
        this.sprite.destroy();
    }
}

enum DeathKeys {
    ElfArcher = "elf-archer-death",
    Skeleton = "skeleton-death"
}

export class CorpsesDisplayModule extends DisplayModule<AutoRpgDisplay> {
    private display: AutoRpgDisplay;
    private corpses = new Map<number, CorpseView>();
    
    public init(display: AutoRpgDisplay): void {
        this.display = display;
        this.InitAnimations();
    }

    public update(_: number): void {
        this.corpses.forEach((view, entity) => {
            if (!this.display.corpses.find(data => data.id === entity)) {
                view.destroy();
                this.corpses.delete(entity);
            }
        });
        
        this.display.corpses.forEach(corpse => {
            let view = this.corpses.get(corpse.id);
            if (!view) {
                view = new CorpseView(this.display, corpse.x, corpse.y, corpse.type);
                const anim = DeathKeys[corpse.type  as any as keyof typeof DeathKeys];
                view.sprite.play(anim, true);
                this.corpses.set(corpse.id, view);
                view.sprite.scaleX = Math.random() > 0.5 ? 1 : -1;
            }
            view.sprite.setAlpha(corpse.rotFactor)
        });
    }

    private InitAnimations() {
        const scene = this.display.scene;

        scene.anims.create({
            key: DeathKeys.Skeleton,
            frames: scene.anims.generateFrameNumbers(DeathKeys.Skeleton, {start: 0, end: 3}),
            frameRate: 6,
            repeat: 0
        });
        
        scene.anims.create({
            key: DeathKeys.ElfArcher,
            frames: scene.anims.generateFrameNumbers(DeathKeys.ElfArcher, {start: 0, end: 9}),
            frameRate: 12,
            repeat: 0
        });
    }
}