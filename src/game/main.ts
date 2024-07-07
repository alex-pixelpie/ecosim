import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { AutoRpg} from './scenes/AutoRpg.ts';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import {TilesPaintingScene} from "./scenes/TilesPaintingScene.ts";
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
import {SpawnChanceConfigScene} from "./scenes/SpawnChanceConfigScene.ts";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        AutoRpg,
        GameOver,
        TilesPaintingScene,
        SpawnChanceConfigScene
    ],
    plugins: {
        global: [
            { key: 'rexOutlinePipeline', plugin: OutlinePipelinePlugin, start: true}
        ]
    },
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
