import {LayerDisplayModule} from "./LayerDisplayModule.ts";
import {TileDisplayData} from "../GameDisplay.ts";

export class TileSurfaceMoistureDisplayModule extends LayerDisplayModule {
    mult = 0.6;

    protected tileProcessor(tile:TileDisplayData, x: number, y: number): void {
        if (isNaN(tile.groundMoisture)) {
            return;
        }

        const mapTile = this.layer.getTileAt(x, y, false);

        if (mapTile == null || tile.groundMoisture == -1) {
            return;
        }
        
        mapTile.setAlpha(this.mult * (this.display.tiles[x][y].surfaceMoisture / this.display.config.maxMoistureInTile));
        this.layer.setTint(0x0000ff, x, y, 1, 1);
        mapTile.index = this.display.config.whiteTile;
        this.layer.putTileAt(mapTile, x, y, false);
    }
}