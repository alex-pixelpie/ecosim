import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "./AutoRpgDisplay.ts";
import {ControlledCamera} from "../ecosim/CameraModule.ts";
//
// class ControlledCamera {
//     static maxTimeBetweenClicks = 200;
//     static maxZoom = 4 * 8;
//     static minZoom = 0.14 * 8;
//
//     private scene: Phaser.Scene;
//     private camera: Phaser.Cameras.Scene2D.Camera;
//     public constructor(scene: Phaser.Scene, cameraWidth: number, cameraHeight: number) {
//         this.scene = scene;
//         this.setupCamera(cameraWidth, cameraHeight);
//     }
//     private resetZoom(){
//         this.camera.pan(this.camera.width/2, this.camera.height/2, 0.3, 'Linear', true);
//         this.camera.zoomTo(ControlledCamera.minZoom, 0.3);
//     }
//
//     update(delta:number) {
//     }
//
//     private setupCamera(cameraWidth: number, cameraHeight: number) {
//         this.camera = this.scene.cameras.main;
//         this.camera.setBackgroundColor(0x000000);
//         this.camera.setBounds(0, 0, cameraWidth, cameraHeight);
//        
//         this.resetZoom();
//     }
// }

export class CameraModule extends DisplayModule<AutoRpgDisplay> {
    public Camera: ControlledCamera;

    override init(display: AutoRpgDisplay) {
        this.Camera = new ControlledCamera(display.scene, display.mapDisplay.map.widthInPixels, display.mapDisplay.map.heightInPixels);
    }

    override update(delta: number) {
        this.Camera?.update(delta);
    }
}