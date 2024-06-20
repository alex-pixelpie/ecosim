import {MobView} from "./MobView.ts";
import {Healthbar, HealthData} from "../effects/Healthbar.ts";
import {MobData} from "../AutoRpgDisplay.ts";
import { GroupRing } from "../effects/GroupRing.ts";
import {SensoryRangeDisplay} from "../effects/SensoryRangeDisplay.ts";
import {WeaponRangeDisplay} from "../effects/WeaponRangeDisplay.ts";
import { Tap } from 'phaser3-rex-plugins/plugins/gestures.js';
import {EventBus, GameEvents} from "../../../EventBus.ts";

export class SpritesMobView extends MobView {
    sprites: Map<string, Phaser.GameObjects.Sprite>;
    healthbar:Healthbar;
    sensorRangeDisplay: SensoryRangeDisplay;
    groupRing:GroupRing;
    weaponRangeDisplay: WeaponRangeDisplay;
    walkAnimName: string;
    attackAnimName: string;
    idleAnimName: string;
    tap: Tap;
    wasSelected:boolean;
    
    protected init(x: number, y: number): void {
        if (this.sprites) {
            return;
        }

        this.sprites = new Map();
        this.container = this.display.scene.add.container(x, y);
        this.container.setSize(40, 40); // TODO - get proper size from sprite
        
        this.sprites.set(this.attackAnimName, this.display.scene.add.sprite(x, y, this.attackAnimName).setVisible(false));
        this.sprites.set(this.idleAnimName, this.display.scene.add.sprite(x, y, this.idleAnimName).setVisible(false));
        this.sprites.set(this.walkAnimName, this.display.scene.add.sprite(x, y, this.walkAnimName).setVisible(false));

        this.sprites.forEach(sprite => {
            this.container.add(sprite);
        });

        this.display.mobsLayer.add(this.container);

        // Initialize health bar
        this.healthbar = new Healthbar(this.display, true);
        
        // Initialize group ring
        this.groupRing = new GroupRing(this.display);
        
        // Initialize sensory range display
        this.sensorRangeDisplay = new SensoryRangeDisplay(this.display);
        
        // Initialize weapon range display
        this.weaponRangeDisplay = new WeaponRangeDisplay(this.display);

        this.tap = new Tap(this.container, {
            
        });
        
        const id = this.id;
        
        this.tap.on('tap', function () {
            EventBus.emit(GameEvents.EntityTap, id);
        });
    }

    destroy(): void {
        this.container.destroy();
        this.sprites.forEach(sprite => sprite.destroy());
        this.sprites.clear();
        this.healthbar.destroy();
        this.groupRing.destroy();
        this.sensorRangeDisplay.destroy();
        this.weaponRangeDisplay.destroy();
        this.tap.destroy();
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

        this.healthbar.update(mob as HealthData, this.container);
        this.groupRing.update(mob, this.container);
        this.sensorRangeDisplay.update(this.container, mob.sensoryRange || 0, mob.targetsInRange || 0);
        this.weaponRangeDisplay.update(this.container, mob.minAttackRange || 0, mob.maxAttackRange || 0);

        this.container.x = mob.x+ 20; // Offset can be adjusted as needed
        this.container.y = mob.y;
        this.container.scaleX = mob.state.direction;
        
        this.sprite.visible = true;
        
        if (mob.isSelected){
            if (this.wasSelected){
                return;
            }
            this.sprites.forEach(sprite => {
                this.display.outlinePlugin.add(sprite, {
                    thickness: 5,
                    outlineColor: 0xff0000,
                    quality: 0.1
                });
            });
        } else {
            if (!this.wasSelected){
                return;
            }
            this.sprites.forEach(sprite => {
                this.display.outlinePlugin.remove(sprite);
            });
        }
        
        this.wasSelected = !!mob.isSelected;
    }
}
    