import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay, CorpseData} from "./AutoRpgDisplay.ts";
import {Selection} from "./effects/Selection.ts";

class CorpseView {
    sprite: Phaser.GameObjects.Sprite;
    selection:Selection;
    
    constructor(public display: AutoRpgDisplay, public id:number, public x: number, public y: number, public type: string) {
        this.sprite = display.scene.add.sprite(x, y, type);
        display.corpsesLayer.add(this.sprite);
        
        this.selection = new Selection(this.sprite, [this.sprite], display.outlinePlugin, id);
    }

    destroy(): void {
        this.sprite.destroy();
        this.selection.destroy();
    }

    update(corpse: CorpseData) {
        this.sprite.setAlpha(corpse.isObserved ? corpse.rotFactor : 0);
        this.selection.update(corpse);
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
                view = new CorpseView(this.display, corpse.id, corpse.x, corpse.y, corpse.subtype);
                const anim = DeathKeys[corpse.subtype  as any as keyof typeof DeathKeys];
                view.sprite.play(anim, true);
                this.corpses.set(corpse.id, view);
                view.sprite.scaleX = Math.random() > 0.5 ? 1 : -1;
            }
            view.update(corpse);            
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

    public destroy(): void {
    }
}