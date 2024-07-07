import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "./AutoRpgDisplay.ts";


const maxFrame = 16;

export class DungeonFloorDisplayModule extends DisplayModule<AutoRpgDisplay> {
    protected layer: Phaser.Tilemaps.TilemapLayer;
    protected display: AutoRpgDisplay;

    public init(display: AutoRpgDisplay): void {
        this.display = display;
        this.layer = display.mapDisplay.map.createBlankLayer(this.constructor.name, display.mapDisplay.tileset, 0, 0)!;

        this.display.tiles.forEach((column, x) => {
            column.forEach((_, y) => {
                this.layer.putTileAt(0, x, y, false).setAlpha(0);
            });
        });

        display.tiles.forEach((column, x) => {
            column.forEach((tile, y) => {
                const mapTile = this.layer.getTileAt(x, y, false);

                if (mapTile == null) {
                    return;
                }

                let displayValue = 0;
                
                mapTile.setAlpha(tile.isObserved ? 1 : 0);
                mapTile.index = displayValue;
                mapTile.rotation = Math.floor(Math.random() * 4) * Math.PI;
                this.layer.putTileAt(mapTile, x, y, false);
            });
        });
    }

    public update(_: number): void {
        this.display.tiles.forEach((column, x) => {
            column.forEach((tile, y) => {
                const mapTile = this.layer.getTileAt(x, y, false);
                mapTile.index = Math.round(tile.chanceOfSpawn * maxFrame);
                mapTile.setAlpha(tile.isObserved ? 1 : 0);
                this.layer.putTileAt(mapTile, x, y, false);
            });
        });
    }
    
    public destroy(): void {
        this.layer.destroy();
    }

}