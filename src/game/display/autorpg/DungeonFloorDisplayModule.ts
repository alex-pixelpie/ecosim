import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "../autorpg/AutoRpgDisplay.ts";


enum GroundVisualState {
    None = -1,
    Dry = 0,
    Normal = 1,
    Rich = 2
}

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

                let displayValue = GroundVisualState.Rich;
                
                mapTile.setAlpha(tile.isObserved ? 1 : 0);
                mapTile.index = displayValue;
                this.layer.putTileAt(mapTile, x, y, false);
            });
        });
    }

    public update(_: number): void {
        this.display.tiles.forEach((column, x) => {
            column.forEach((tile, y) => {
                const mapTile = this.layer.getTileAt(x, y, false);
                mapTile.setAlpha(tile.isObserved ? 1 : 0);
            });
        });
    }
    
    public destroy(): void {
        this.layer.destroy();
    }

}