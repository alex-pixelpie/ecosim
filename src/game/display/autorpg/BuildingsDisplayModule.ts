import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay, BuildingData} from "./AutoRpgDisplay.ts";
import {Healthbar, HealthData} from "./effects/Healthbar.ts";
import {GroupRing} from "./effects/GroupRing.ts";
import {Selection} from "./effects/Selection.ts";
import {ConquestProgress} from "./effects/ConquestProgress.ts";
import {Pos} from "../../utils/Math.ts";

class BuildingView {
    sprite: Phaser.GameObjects.Sprite;
    healthbar:Healthbar;
    conquestProgress:ConquestProgress;
    groupRing:GroupRing;
    selection:Selection;
    
    constructor(public display: AutoRpgDisplay, public id:number, public x: number, public y: number, public type: string, public offset:Pos = {x:0, y:0}) {
        this.sprite = display.scene.add.sprite(x, y, type);
        display.mobsLayer.add(this.sprite);
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.x += offset.x;
        this.sprite.y += offset.y;
        
        this.healthbar = new Healthbar(this.display, false);
        this.conquestProgress = new ConquestProgress(this.display, false);
        
        // Initialize group ring
        // this.groupRing = new GroupRing(this.display, 5);
        
        // Initialize selection effect
        this.selection = new Selection(this.sprite, [this.sprite], this.display.outlinePlugin, id);
    }

    destroy(): void {
        this.sprite.destroy();
        this.healthbar.destroy();
        this.groupRing?.destroy();
        this.selection.destroy();
        this.conquestProgress.destroy();
    }
    
    update(building:BuildingData){
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.x = building.x + this.offset.x; 
        this.sprite.y = building.y + this.offset.y;
        
        const destructionFactor = 1 - (building.health as number) / (building.maxHealth as number);
        this.sprite.setFrame(Math.floor(destructionFactor * destructionStages));
        
        this.selection.update(building);
        this.healthbar?.update(building as HealthData, this.sprite);
        this.groupRing?.update(building, this.sprite);
        this.conquestProgress.update(building, this.sprite);
        
        this.sprite.alpha = building.isObserved ? 1 : 0;
    }
}

enum BuildingKeys {
    PlayerTower = "tower-player",
    MobTower = "tower-enemy",
}

const destructionStages = 4; // TODO - config this shit

export class BuildingsDisplayModule extends DisplayModule<AutoRpgDisplay> {
    public destroy(): void {
    }
    
    private display: AutoRpgDisplay;
    private buildings = new Map<number, BuildingView>();
    
    public init(display: AutoRpgDisplay): void {
        this.display = display;
    }

    public update(_: number): void {
        this.buildings.forEach((view, entity) => {
            if (!this.display.buildings.find(data => data.id === entity)) {
                view.destroy();
                this.buildings.delete(entity);
            }
        });
        
        this.display.buildings.forEach(building => {
            let view = this.buildings.get(building.id);
            if (!view) {
                view = new BuildingView(this.display, building.id, building.x, building.y, BuildingKeys[building.subtype  as any as keyof typeof BuildingKeys], {x:0, y:-25});
                this.buildings.set(building.id, view);
            }
            view.update(building);
        });
    }
}