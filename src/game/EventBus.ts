import { Events } from 'phaser';

// Used to emit events between React components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
export const EventBus = new Events.EventEmitter();


export const enum UiEvents {
    DoubleClick = 'double-click',
    TileSelected = 'tile-selected',
    GameUpdate = 'game-update',
    WindConfigCreated = 'wind-config-created',
    WindConfigUpdated = 'wind-config-updated',
    PlantSelected = 'plant-selected',
    EntitySelected = "entity-selected"
}

export const enum GameEvents {
    GameOver = 'game-over',
    GameStart = 'game-start',
    EntityTap = 'entity-tap',
}