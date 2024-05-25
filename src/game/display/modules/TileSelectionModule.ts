import {DisplayModule, GameDisplay, TileDisplayData} from "../GameDisplay.ts";
import Vector2 = Phaser.Math.Vector2;
import {MapDisplay} from "../MapDisplay.ts";
import {EventBus, UiEvents} from "../../EventBus.ts";

export class TileSelectionModule extends DisplayModule {
    private hoverMarker: Phaser.GameObjects.Graphics;
    private selectedMarker: Phaser.GameObjects.Graphics;
    private scene : Phaser.Scene;
    private mapDisplay: MapDisplay;
    private game: GameDisplay;
    private selectedTile: TileDisplayData | null = null;

    override init(game: GameDisplay) {
        this.scene = game.scene;
        this.mapDisplay = game.mapDisplay;
        this.game = game;
        
        this.hoverMarker = this.scene.add.graphics();
        this.hoverMarker.lineStyle(3, 0xffffff, 1);
        this.hoverMarker.strokeRect(0, 0, game.mapDisplay.map.tileWidth, game.mapDisplay.map.tileHeight);

        this.selectedMarker = this.scene.add.graphics();
        this.selectedMarker.lineStyle(3, 0xff0000, 1);
        this.selectedMarker.strokeRect(0, 0, game.mapDisplay.map.tileWidth, game.mapDisplay.map.tileHeight);
    }

    override update(_delta: number) {
        const worldPoint = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main) as Vector2;
        const map = this.mapDisplay.map;

        // Rounds down to nearest tile
        const pointerTileX = map.worldToTileX(worldPoint.x) || 0;
        const pointerTileY = map.worldToTileY(worldPoint.y) || 0;
        const isPointerInBounds = pointerTileX >= 0 && pointerTileX < map.width && pointerTileY >= 0 && pointerTileY < map.height;
        
        // Snap to tile coordinates, but in world space
        this.hoverMarker.x = map.tileToWorldX(pointerTileX)|| 0;
        this.hoverMarker.y = map.tileToWorldY(pointerTileY)|| 0;

        if (isPointerInBounds && this.scene.input.manager.activePointer.leftButtonDown())
        {
            this.selectedTile = this.game.tiles[pointerTileX][pointerTileY];
            this.selectedMarker.clear();
            this.selectedMarker.lineStyle(3, 0xff0000, 1);
            this.selectedMarker.strokeRect(0, 0, map.tileWidth, map.tileHeight);

            // Snap to tile coordinates, but in world space
            this.selectedMarker.x = map.tileToWorldX(pointerTileX)|| 0;
            this.selectedMarker.y = map.tileToWorldY(pointerTileY)|| 0;
        }

        this.updateSelectedTile();

        this.hoverMarker.clear();
        this.hoverMarker.lineStyle(3, 0xffffff, 1);
        this.hoverMarker.strokeRect(0, 0, this.mapDisplay.map.tileWidth, this.mapDisplay.map.tileHeight);
    }
    
    private updateSelectedTile() {
        if (this.selectedTile != null) {
            const pos = this.selectedTile.position;
            this.selectedTile = this.game.tiles[pos.x][pos.y];
        }
        
        EventBus.emit(UiEvents.TileSelected, this.selectedTile);
    }
}