import {Tap} from "phaser3-rex-plugins/plugins/gestures";
import {EventBus, GameEvents} from "../../../EventBus.ts";
import {SelectableData} from "../AutoRpgDisplay.ts";
import GameObject = Phaser.GameObjects.GameObject;
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin.js";

export class Selection {
    tap: Tap;
    wasSelected:boolean;
    
    constructor(public tapTarget: GameObject, public selectionTargets:GameObject[], public plugin:OutlinePipelinePlugin ,public id: number) {
        this.tap = new Tap(tapTarget, {

        });

        this.tap.on('tap', function () {
            EventBus.emit(GameEvents.EntityTap, id);
        });
    }

    destroy(): void {
        this.tap.destroy();
    }
    
    update(selectable:SelectableData): void {
        if (selectable.isSelected){
            if (this.wasSelected){
                return;
            }
            this.selectionTargets.forEach(sprite => {
                this.plugin.add(sprite, {
                    thickness: 1,
                    outlineColor: 0xff0000,
                    quality: 0.1
                });
            });
        } else {
            if (!this.wasSelected){
                return;
            }
            this.selectionTargets.forEach(sprite => {
                this.plugin.remove(sprite);
            });
        }

        this.wasSelected = !!selectable.isSelected;
    }
}