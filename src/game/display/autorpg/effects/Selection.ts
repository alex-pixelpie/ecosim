import {Tap} from "phaser3-rex-plugins/plugins/gestures";
import {EventBus, GameEvents} from "../../../EventBus.ts";
import {ObservableData, SelectableData} from "../AutoRpgDisplay.ts";
import GameObject = Phaser.GameObjects.GameObject;
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin.js";

export class Selection {
    tap: Tap;
    wasSelected:boolean;
    followTarget: GameObject;
    isObserved: boolean = false;
    
    constructor(public tapTarget: GameObject, public selectionTargets:GameObject[], public plugin:OutlinePipelinePlugin ,public id: number) {
        this.tap = new Tap(tapTarget, {

        });

        this.tap.on('tap', this.onTap.bind(this));

        this.followTarget = tapTarget;
    }

    onTap(){
        if (!this.isObserved){
            return;
        }
        
        EventBus.emit(GameEvents.EntityTap, this.id);
    }
    
    destroy(): void {
        this.tap.destroy();
    }
    
    update(selectable:SelectableData&ObservableData): void {
        this.isObserved = selectable.isObserved;
        
        if (selectable.isSelected){
            if (this.wasSelected){
                return;
            }
            EventBus.emit(GameEvents.FollowSpriteSelected, this.followTarget);

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