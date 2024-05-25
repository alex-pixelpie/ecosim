import {DisplayModule, GameDisplay, TileDisplayData} from "../GameDisplay.ts";

export abstract class LayerDisplayModule extends DisplayModule {
    protected layer: Phaser.Tilemaps.TilemapLayer;
    protected display: GameDisplay;

    public init(display: GameDisplay): void {
        this.display = display;
        this.layer = display.mapDisplay.map.createBlankLayer(this.constructor.name, display.mapDisplay.tileset, 0, 0)!;

        this.display.tiles.forEach((column, x) => {
            column.forEach((_, y) => {
                this.layer.putTileAt(0, x, y, false).setAlpha(0);
            });
        });

        display.tiles.forEach((column, x) => {
            column.forEach((tile, y) => {
                this.tileProcessor(tile, x, y, 0);
            });
        });
    }

    public update(delta: number): void {
        this.display.tiles.forEach((column, x) => {
            column.forEach((tile, y) => {
                this.tileProcessor(tile, x, y, delta);
            });
        });
    }

    protected abstract tileProcessor(tile:TileDisplayData, x:number, y:number, delta:number) : void;
}
