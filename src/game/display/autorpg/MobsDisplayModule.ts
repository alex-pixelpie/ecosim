import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "./AutoRpgDisplay.ts";
import {MobView} from "./mobs/MobView.ts";
import {SkeletonView} from "./mobs/SkeletonView.ts";
import {ElfArcherView} from "./mobs/ElfArcherView.ts";
import {MobType} from "../../configs/MobsConfig.ts";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin";
import {SpritesMobView} from "./mobs/SpritesMobView.ts";

export namespace MobsDisplayModule {
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
                    const TypeConstructor = mob.type == MobType.Skeleton ? SkeletonView : ElfArcherView;
                    view = new TypeConstructor(this.display, mob.id, mob.x, mob.y);
                    this.mobs.set(mob.id, view);
                }
                view.update(mob, this.display);
            });
        }

        private InitAnimations() {
            SkeletonView.initAnimations(this.display.scene);
            ElfArcherView.initAnimations(this.display.scene);
        }
    }
}