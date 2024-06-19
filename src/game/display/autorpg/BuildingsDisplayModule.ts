import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "./AutoRpgDisplay.ts";
import {Healthbar, HealthData} from "./effects/Healthbar.ts";
import {GroupRing} from "./effects/GroupRing.ts";

class BuildingView {
    sprite: Phaser.GameObjects.Sprite;
    healthbar:Healthbar;
    groupRing:GroupRing;

    constructor(public display: AutoRpgDisplay, public x: number, public y: number, public type: string, offset:{x:number, y:number} = {x:0, y:0}) {
        this.sprite = display.scene.add.sprite(x, y, type);
        display.mobsLayer.add(this.sprite);
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.x += offset.x;
        this.sprite.y += offset.y;
        
        // Initialize health bar
        this.healthbar = new Healthbar(this.display, false);
        
        // Initialize group ring
        // this.groupRing = new GroupRing(this.display, 5);
    }

    destroy(): void {
        this.sprite.destroy();
        this.healthbar.destroy();
        this.groupRing?.destroy();
    }
}

enum BuildingKeys {
    Base = "castle",
    Lair = "lair",
}

const destructionStages = 4; // TODO - config this shit

export class BuildingsDisplayModule extends DisplayModule<AutoRpgDisplay> {
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
                view = new BuildingView(this.display, building.x, building.y, BuildingKeys[building.type  as any as keyof typeof BuildingKeys], {x:0, y:-25});
                this.buildings.set(building.id, view);
            }
            view.healthbar?.update(building as HealthData, view.sprite);
            view.groupRing?.update(building, view.sprite);
            const destructionFactor = 1 - (building.health as number) / (building.maxHealth as number);
            view.sprite.setFrame(Math.floor(destructionFactor * destructionStages));
        });
    }
}