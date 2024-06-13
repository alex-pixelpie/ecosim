import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { EcoSim} from './scenes/EcoSim.ts';
import { AutoRpg} from './scenes/AutoRpg.ts';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import {TilesPaintingScene} from "./scenes/TilesPaintingScene.ts";

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
        EcoSim,
        AutoRpg,
        GameOver,
        TilesPaintingScene
    ],
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
