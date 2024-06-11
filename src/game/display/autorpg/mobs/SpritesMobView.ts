import {MobView} from "./MobView.ts";
import {Healthbar} from "../effects/Healthbar.ts";
import {MobData} from "../AutoRpgDisplay.ts";

export class SpritesMobView extends MobView {
    sprites: Map<string, Phaser.GameObjects.Sprite>;
    healthbar:Healthbar;
    walkAnimName: string;
    attackAnimName: string;
    idleAnimName: string;
    
    protected init(x: number, y: number): void {
        if (this.sprites) {
            return;
        }

        this.sprites = new Map();
        this.sprites.set(this.attackAnimName, this.display.scene.add.sprite(x, y, this.attackAnimName).setVisible(false));
        this.sprites.set(this.idleAnimName, this.display.scene.add.sprite(x, y, this.idleAnimName).setVisible(false));
        this.sprites.set(this.walkAnimName, this.display.scene.add.sprite(x, y, this.walkAnimName).setVisible(false));

        this.sprites.forEach(sprite => {
            this.display.mobsLayer.add(sprite);
        });

        // Initialize health bar
        this.healthbar = new Healthbar(this.display);
    }

    destroy(): void {
        this.sprites.forEach(sprite => sprite.destroy());
        this.sprites.clear();
        this.healthbar.destroy();
    }

    public update(mob: MobData): void {
        if (!this.sprites) {
            this.init(0, 0);
            return;
        }

        if (!mob) {
            this.destroy();
            return;
        }

        this.sprites.forEach(sprite => sprite.visible = false);

        if (mob.state.moving) {
            this.sprite = this.sprites.get(this.walkAnimName) as Phaser.GameObjects.Sprite;
            this.sprite.play(this.walkAnimName, true);
        } else if (mob.state.attacking) {
            this.sprite = this.sprites.get(this.attackAnimName) as Phaser.GameObjects.Sprite;
            this.sprite.play(this.attackAnimName, true);
        } else {
            this.sprite = this.sprites.get(this.idleAnimName) as Phaser.GameObjects.Sprite;
            this.sprite.play(this.idleAnimName, true);
        }

        if (mob.state.damage) {
            // Indicate damage with a brief red flash
            this.sprite.setTint(0xff0000);
            this.display.scene.time.delayedCall(100, () => {
                this.sprites.forEach(sprite => sprite.clearTint());
            });
        }

        this.healthbar.update(mob, this.sprite);

        this.sprite.x = mob.x + 20; // Offset can be adjusted as needed
        this.sprite.y = mob.y;
        this.sprite.scaleX = mob.state.direction;
        this.sprite.visible = true;
    }
}
    