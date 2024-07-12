import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "./AutoRpgDisplay.ts";
import {MobView} from "./mobs/MobView.ts";
import {SkeletonView} from "./mobs/SkeletonView.ts";
import {ElfArcherView} from "./mobs/ElfArcherView.ts";
import {MobType} from "../../configs/MobsConfig.ts";
import {BlueKingView} from "./mobs/BlueKingView.ts";

const mobTypeToClass:Map<MobType, Function> = new Map([
    [MobType.Skeleton, SkeletonView as Function],
    [MobType.ElfArcher, ElfArcherView],
    [MobType.BlueKing, BlueKingView]
]);

export namespace MobsDisplayModule {
    export class MobsDisplayModule extends DisplayModule<AutoRpgDisplay> {
        public destroy(): void {
            this.mobs.forEach(view => view.destroy());
            this.mobs.clear();
        }
        
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
                    const TypeConstructor = mobTypeToClass.get(mob.subtype as MobType);
                    if (!TypeConstructor) {
                        console.error(`No view found for mob type ${mob.subtype}`);
                        return;
                    }
                    
                    view = new TypeConstructor(this.display, mob.id, mob.x, mob.y);
                    this.mobs.set(mob.id, view);
                }
                view.update(mob, this.display);
            });
        }

        private InitAnimations() {
            SkeletonView.initAnimations(this.display.scene);
            ElfArcherView.initAnimations(this.display.scene);
            BlueKingView.initAnimations(this.display.scene);
        }
    }
}