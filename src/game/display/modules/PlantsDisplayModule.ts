import {DisplayModule, GameDisplay, PlantDisplayData} from "../GameDisplay.ts";
import {EventBus, UiEvents} from "../../EventBus.ts";

export namespace PlantsDisplayModule {
    import Vector2 = Phaser.Math.Vector2;

    export class PlantsDisplayModule extends DisplayModule {
        private display: GameDisplay;
        private graphics: Phaser.GameObjects.Graphics;
        private selected: PlantDisplayData | undefined;
        public init(display: GameDisplay): void {
            this.display = display;
            this.graphics = this.display.scene.add.graphics();
        }
        
        public update(_: number): void {
            const graphics= this.graphics;
            graphics.clear();

            this.display.plants.forEach(plant => {
                if (plant.vitality == 'Dead') {
                    graphics.fillStyle(0xcccccc); // Gray for dead plants
                } else {
                    graphics.fillStyle(0x00ff00); // Green for alive plants
                }

                if (this.selected?.id === plant.id) {
                    this.selected = plant;
                    graphics.fillStyle(0xff0000);
                }
                
                graphics.fillCircle(plant.position.x, plant.position.y, Number(plant.radius));
            });
            
            const worldPoint = this.display.scene.input.activePointer.positionToCamera(this.display.scene.cameras.main) as Vector2;

            if (this.display.scene.input.manager.activePointer.leftButtonDown())
            {

                const selected = this.display.plants.find(plant => {
                    return Math.hypot(plant.position.x - worldPoint.x, plant.position.y - worldPoint.y) < Number(plant.radius);
                });
                
                this.selected = selected;
            }

            this.selected = this.selected || this.display.plants?.[0];

            graphics.stroke();

            EventBus.emit(UiEvents.PlantSelected, this.selected);
        }
    }
}