
export class MapConfig {
    tilesInMapSide: number = 64;
    tileSize: number = 32;
    
    public get pixelsSize(): number {
        return this.tilesInMapSide * this.tileSize;
    }
}
