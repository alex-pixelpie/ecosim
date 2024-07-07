import Vector2 = Phaser.Math.Vector2;
import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "../autorpg/AutoRpgDisplay.ts";
import {MapDisplay} from "../MapDisplay.ts";
import {Pos} from "../../utils/Math.ts";

export class TilePaintingModule extends DisplayModule<AutoRpgDisplay> {
    public destroy(): void {
    }
    
    private hoverMarker: Phaser.GameObjects.Graphics;
    private selectedIndicator: Phaser.GameObjects.Graphics;
    private scene : Phaser.Scene;
    private mapDisplay: MapDisplay;
    private game: AutoRpgDisplay;
    private selectedTiles: Pos[] = [];

    override init(game: AutoRpgDisplay) {
        this.scene = game.scene;
        this.mapDisplay = game.mapDisplay;
        this.game = game;

        this.hoverMarker = this.scene.add.graphics();
        this.hoverMarker.lineStyle(3, 0xffffff, 1);
        this.hoverMarker.strokeRect(0, 0, game.mapDisplay.map.tileWidth, game.mapDisplay.map.tileHeight);

        this.selectedIndicator = this.scene.add.graphics();
        this.selectedIndicator.lineStyle(3, 0xff0000, 1);
    }

    override update(_delta: number) {
        const worldPoint = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main) as Vector2;
        const map = this.mapDisplay.map;

        // Rounds down to nearest tile
        const pointerTileX = map.worldToTileX(worldPoint.x) || 0;
        const pointerTileY = map.worldToTileY(worldPoint.y) || 0;
        const isPointerInBounds = pointerTileX >= 0 && pointerTileX < map.width && pointerTileY >= 0 && pointerTileY < map.height;

        // Snap to tile coordinates, but in world space
        this.hoverMarker.x = map.tileToWorldX(pointerTileX) || 0;
        this.hoverMarker.y = map.tileToWorldY(pointerTileY) || 0;

        if (isPointerInBounds && this.scene.input.manager.activePointer.leftButtonDown())
        {
            const tile = this.game.tiles[pointerTileX][pointerTileY].position;
            if (!this.selectedTiles.some(t=>t.x==tile.x&&t.y==tile.y)) this.selectedTiles.push(tile);

            const jsonData = JSON.stringify(this.selectedTiles);
            console.log(jsonData);
        }

        if (isPointerInBounds && this.scene.input.manager.activePointer.rightButtonDown())
        {
            const tile = this.game.tiles[pointerTileX][pointerTileY].position;
            if (this.selectedTiles.some(t=>t.x==tile.x&&t.y==tile.y)) this.selectedTiles = this.selectedTiles.filter(t => {
                return t.x != tile.x || t.y != tile.y;
            });

            const jsonData = JSON.stringify(this.selectedTiles);
            console.log(jsonData);
        }

        this.selectedIndicator.clear();
        this.selectedIndicator.lineStyle(3, 0xff0000, 1);

        this.selectedTiles.forEach(tile => {
            const tileWorldX = map.tileToWorldX(tile.x) || 0;
            const tileWorldY = map.tileToWorldY(tile.y) || 0;
            this.selectedIndicator.strokeRect(tileWorldX, tileWorldY, this.mapDisplay.map.tileWidth, this.mapDisplay.map.tileHeight);
        });
    }
}