import {EcoSimDisplayModule} from "./EcoSimDisplayModule.ts";
import {TileDisplayData} from "./EcoSimDisplay.ts";

export class CloudCoverDisplayModule extends EcoSimDisplayModule {
    mult = 0.2;

    protected tileProcessor(tile:TileDisplayData, x: number, y: number): void {
        if (isNaN(tile.groundMoisture as number)) {
            return;
        }

        const mapTile = this.layer.getTileAt(x, y, false);

        if (mapTile == null || tile.groundMoisture == -1) {
            return;
        }
        
        mapTile.setAlpha(this.mult * (this.display.tiles[x][y].cloudCover as number));
        this.layer.setTint(0x000000, x, y, 1, 1);
        mapTile.index = this.display.config.whiteTile;
        this.layer.putTileAt(mapTile, x, y, false);
    }
}