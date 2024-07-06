export class MapDisplay {
    map: Phaser.Tilemaps.Tilemap;
    tileset: Phaser.Tilemaps.Tileset;
    constructor(scene:Phaser.Scene, size: number){
        const mapData = new Phaser.Tilemaps.MapData({
            width: size,
            height: size,
            tileWidth: 32,
            tileHeight: 32,
            orientation: Phaser.Tilemaps.Orientation.ORTHOGONAL,
            format: Phaser.Tilemaps.Formats.ARRAY_2D
        });

        // Create a new blank tilemap
        this.map = new Phaser.Tilemaps.Tilemap(scene, mapData);

        // Add tilesets to the map
        this.tileset = this.map.addTilesetImage('ground', 'ground')!;
    }
}