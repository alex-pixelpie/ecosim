import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay, MobData} from "./AutoRpgDisplay.ts";

export namespace MobsDisplayModule {
    abstract class MobView {
        sprite: Phaser.GameObjects.Sprite;
        public constructor(public display: AutoRpgDisplay, public id: number, x: number = 0, y: number = 0) {
            this.init(x, y);
        }

        protected abstract init(x: number, y: number): void;
        
        abstract update(mob: MobData, display: AutoRpgDisplay): void;

        abstract destroy(): void;
    }
    
    export enum SkeletonAnimationState {
        Idle = 'skeleton-idle',
        Walking = 'skeleton-walk',
        Attacking = 'skeleton-attack',
        Dead = 'skeleton-dead'
    }

    class SkeletonView extends MobView {
        sprites: Map<SkeletonAnimationState, Phaser.GameObjects.Sprite>;
        healthBar: Phaser.GameObjects.Graphics;

        protected init(x: number, y: number): void {
            if (this.sprites) {
                return;
            }

            this.sprites = new Map();
            this.sprites.set(SkeletonAnimationState.Idle, this.display.scene.add.sprite(x, y, SkeletonAnimationState.Idle).setVisible(false));
            this.sprites.set(SkeletonAnimationState.Walking, this.display.scene.add.sprite(x, y, SkeletonAnimationState.Walking).setVisible(false));
            this.sprites.set(SkeletonAnimationState.Attacking, this.display.scene.add.sprite(x, y, SkeletonAnimationState.Attacking).setVisible(false));

            this.sprites.forEach(sprite => {
                this.display.mobsLayer.add(sprite);
            });
            
            // Initialize health bar
            this.healthBar = this.display.scene.add.graphics();

            this.display.mobUi.add(this.healthBar);
        }

        destroy(): void {
            this.sprites.forEach(sprite => sprite.destroy());
            this.sprites.clear();
            this.healthBar.destroy();
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
                this.sprite = this.sprites.get(SkeletonAnimationState.Walking) as Phaser.GameObjects.Sprite;
                this.sprite.play(SkeletonAnimationState.Walking, true);
            } else if (mob.state.attacking) {
                this.sprite = this.sprites.get(SkeletonAnimationState.Attacking) as Phaser.GameObjects.Sprite;
                this.sprite.play(SkeletonAnimationState.Attacking, true);
            } else {
                this.sprite = this.sprites.get(SkeletonAnimationState.Idle) as Phaser.GameObjects.Sprite;
                this.sprite.play(SkeletonAnimationState.Idle, true);
            }

            if (mob.state.damage) {
                // Indicate damage with a brief red flash
                this.sprite.setTint(0xff0000);
                this.display.scene.time.delayedCall(100, () => {
                    this.sprites.forEach(sprite => sprite.clearTint());
                });
            }

            // Update health bar
            this.updateHealthBar(mob);
            
            this.sprite.x = mob.x + 20; // Offset can be adjusted as needed
            this.sprite.y = mob.y;
            this.sprite.scaleX = mob.state.direction;
            this.sprite.visible = true;
        }

        private updateHealthBar(mob: MobData): void {
            const spriteTopY = this.sprite.y - this.sprite.displayHeight / 4;
            this.healthBar.clear();
            this.healthBar.fillStyle(0x000000, 0.5);
            this.healthBar.fillRect(this.sprite.x - 20, spriteTopY - 10, 40, 5); // Background bar
            this.healthBar.fillStyle(0xff0000, 1);
            const healthWidth = ((mob.health as number) / 100) * 40;
            this.healthBar.fillRect(this.sprite.x - 20, spriteTopY - 10, healthWidth, 5); // Health bar
        }
    }
    export class MobsDisplayModule extends DisplayModule<AutoRpgDisplay> {
        private display: AutoRpgDisplay;
        private mobs = new Map<number, MobView>();

        public init(display: AutoRpgDisplay): void {
            this.display = display;
            this.InitAnimations();
        }
        
        public update(_: number): void {
            this.mobs.forEach((view, entity) => {
                if (!this.display.mobs.find(data => data.id === entity)) {
                    view.destroy();
                    this.mobs.delete(entity);
                }
            });

            this.display.mobs.forEach(mob => {
                let view = this.mobs.get(mob.id);
                if (!view) {
                    view = new SkeletonView(this.display, mob.id, mob.x, mob.y);
                    this.mobs.set(mob.id, view);
                }
                view.update(mob, this.display);
            });
        }

        private InitAnimations() {
            const scene = this.display.scene;

            scene.anims.create({
                key: SkeletonAnimationState.Idle,
                frames: scene.anims.generateFrameNumbers(SkeletonAnimationState.Idle, {start: 0, end: 3}),
                frameRate: 6,
                repeat: 1
            });

            scene.anims.create({
                key: SkeletonAnimationState.Walking,
                frames: scene.anims.generateFrameNumbers(SkeletonAnimationState.Walking, {start: 0, end: 3}),
                frameRate: 12,
                repeat: 1
            });
            
            scene.anims.create({
                key: SkeletonAnimationState.Attacking,
                frames: scene.anims.generateFrameNumbers(SkeletonAnimationState.Attacking, {start: 0, end: 7}),
                frameRate: 12,
                repeat: 1
            });
        }
    }
}