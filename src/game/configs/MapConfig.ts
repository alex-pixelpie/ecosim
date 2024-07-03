
export class MapConfig {
    tilesInMapSide: number = 120;
    tileSize: number = 32;
    
    public get pixelsSize(): number {
        return this.tilesInMapSide * this.tileSize;
    }
}
