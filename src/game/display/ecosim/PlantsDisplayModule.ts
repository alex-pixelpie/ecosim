import {EcoSimDisplay, PlantDisplayData} from "./EcoSimDisplay.ts";
import {EventBus, UiEvents} from "../../EventBus.ts";
import Image = Phaser.GameObjects.Image;
import {DisplayModule} from "../DisplayModule.ts";

const typeToTextureMap = {
    'Grass': 'Grass',
    'Seaweed': 'Seaweed'
} as {[key: string]: string};

export namespace PlantsDisplayModule {
    export class PlantsDisplayModule extends DisplayModule<EcoSimDisplay> {
        private display: EcoSimDisplay;
        private selected: PlantDisplayData | undefined;
        private images = new Map<number, Phaser.GameObjects.Image>();
        private selectedImage: Image | undefined;
        
        public init(display: EcoSimDisplay): void {
            this.display = display;
        }
        
        public update(_: number): void {
            this.images.forEach((image, entity) => {
                if (!this.display.plants.find(plant => plant.id === entity)) {
                    image.destroy();
                    this.images.delete(entity);
                }
            });
            
            this.display.plants.forEach(plant => {
                const texture = typeToTextureMap[plant.type];
                let image = this.images.get(plant.id);
                if (!image) {
                    image = this.display.scene.add.image(plant.position.x, plant.position.y, texture);
                    image.setInteractive();
                    image.on('pointerdown', ()=> {
                        if (this.selectedImage){
                            this.selectedImage.clearTint();
                        }
                        this.selectedImage = image;
                        this.selected = plant;
                        image!.setTint(0x00ff00);
                    });
                    this.images.set(plant.id, image);
                }
                
                if (plant.vitality == 'Dead') {
                    image.setAlpha(0.5);
                } 

                image.scale = (plant.radius as number) / 10;
                
                // Update content
                if (this.selected?.id === plant.id) {
                    this.selected = plant;
                }
            });
            
            EventBus.emit(UiEvents.PlantSelected, this.selected);
        }
    }
}