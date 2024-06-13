import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "./AutoRpgDisplay.ts";

class ControlledCamera {
    static maxTimeBetweenClicks = 200;
    static maxZoom = 4 * 2;
    static minZoom = 0.14 * 2;

    private scene: Phaser.Scene;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private isDown = false;
    private isCountingClicks = false;
    private clickCount = 0;
    private timeout = 0;
    private dragInertia: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    private dragInertiaLossPerSecond = 10;

    public constructor(scene: Phaser.Scene, cameraWidth: number, cameraHeight: number) {
        this.scene = scene;
        this.setupCamera(cameraWidth, cameraHeight);
    }
    private resetZoom(){
        this.camera.pan(this.camera.width/2, this.camera.height/2, 0.3, 'Linear', true);
        this.camera.zoomTo(ControlledCamera.minZoom, 0.3);
    }

    private handlePointerDown() {
        this.isDown = true;

        clearTimeout(this.timeout);

        if (!this.isCountingClicks) {
            this.isCountingClicks = true;
            this.timeout = setTimeout(() => {
                this.isCountingClicks = false;
                this.clickCount = 0;
            }, ControlledCamera.maxTimeBetweenClicks);
        }
    }

    private handlePointerUp() {
        this.isDown = false;

        if (this.isCountingClicks) {
            this.clickCount++;

            if (this.clickCount === 2) {
                this.resetZoom();
                this.isCountingClicks = false;
                this.clickCount = 0;
            }
        }
    }

    private handleWheel(pointer: Phaser.Input.Pointer) {
        var zoom = this.camera.zoom;

        if (pointer.deltaY < 0) {
            zoom = Phaser.Math.Clamp(zoom * 1.1, ControlledCamera.minZoom, ControlledCamera.maxZoom);
        } else {
            zoom = Phaser.Math.Clamp(zoom * 0.9, ControlledCamera.minZoom, ControlledCamera.maxZoom);
        }

        this.adjustCameraToPointer(pointer, zoom);
    }

    private adjustCameraToPointer(pointer: Phaser.Input.Pointer, newZoom:number) {
        const worldPoint = pointer.positionToCamera(this.camera) as Phaser.Math.Vector2; // Get world coordinates of the pointer

        // Calculate the new position based on the zoom factor
        const newX = worldPoint.x - (worldPoint.x - this.camera.scrollX);
        const newY = worldPoint.y - (worldPoint.y - this.camera.scrollY);

        // Set the new zoom and scroll positions
        this.camera.zoomTo(newZoom, 0.3);
        this.camera.setScroll(newX, newY);
    }

    private handlePointerMove(pointer: Phaser.Input.Pointer) {
        if (!this.isDown) {
            return;
        }

        this.dragInertia.x = pointer.x - pointer.prevPosition.x;
        this.dragInertia.y = pointer.y - pointer.prevPosition.y;

        this.camera.scrollX -= (this.dragInertia.x / this.camera.zoom);
        this.camera.scrollY -= (this.dragInertia.y / this.camera.zoom);
    }

    update(delta:number) {
        if (this.dragInertia.x === 0 && this.dragInertia.y === 0) {
            return;
        }

        this.dragInertia.x -= this.dragInertia.x * this.dragInertiaLossPerSecond * delta;
        this.dragInertia.y -= this.dragInertia.y * this.dragInertiaLossPerSecond * delta;

        if (this.isDown){
            return;
        }

        this.camera.scrollX -= (this.dragInertia.x / this.camera.zoom)*delta;
        this.camera.scrollY -= (this.dragInertia.y / this.camera.zoom)*delta;
    }

    private setupCamera(cameraWidth: number, cameraHeight: number) {
        this.camera = this.scene.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.camera.setBounds(0, 0, cameraWidth, cameraHeight);

        this.scene.input.on('pointerdown', this.handlePointerDown, this);
        this.scene.input.on('pointerup', this.handlePointerUp, this);
        this.scene.input.on('pointermove', this.handlePointerMove, this);
        this.scene.input.on("wheel", this.handleWheel, this);

        // this.camera.zoomTo(ControlledCamera.minZoom, 0.3);

        this.resetZoom();
    }
}

export class CameraModule extends DisplayModule<AutoRpgDisplay> {
    public Camera: ControlledCamera;

    override init(display: AutoRpgDisplay) {
        this.Camera = new ControlledCamera(display.scene, display.mapDisplay.map.widthInPixels, display.mapDisplay.map.heightInPixels);
    }

    override update(delta: number) {
        this.Camera?.update(delta);
    }
}