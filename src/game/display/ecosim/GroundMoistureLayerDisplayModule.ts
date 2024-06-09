import {EcoSimDisplayModule} from "./EcoSimDisplayModule.ts";
import {TileDisplayData} from "./EcoSimDisplay.ts";

enum GroundVisualState {
    None = -1,
    Dry = 0,
    Normal = 1,
    Rich = 2
}

export class GroundMoistureLayerDisplayModule extends EcoSimDisplayModule {
    groundRateCutoff = [[200 , GroundVisualState.Dry], [800, GroundVisualState.Normal], [1000, GroundVisualState.Rich]];

    protected tileProcessor(tile:TileDisplayData, x: number, y: number): void {
        if (isNaN(tile.groundMoisture)) {
            return;
        }

        const mapTile = this.layer.getTileAt(x, y, false);

        if (mapTile == null || tile.groundMoisture == -1) {
            return;
        }

        let displayValue = this.groundRateCutoff.find(([cutoff]) => tile.groundMoisture < cutoff)?.[1] ?? GroundVisualState.Rich;

        mapTile.setAlpha(displayValue == -1 ? 0 : 1);
        mapTile.index = displayValue == -1 ? 0 : displayValue;
        this.layer.putTileAt(mapTile, x, y, false);
    }
}