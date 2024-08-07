import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);
        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('grassland-tiles', 'grassland-tiles.png');

        this.load.image('ground', 'ground.png');

        this.load.image('group-ring', 'group-ring.png');
        
        this.load.image('circle', 'circle.png');

        this.load.image('tower-enemy', 'tower.png');
        
        this.load.image('tower-player', 'tower-player.png');
        
        this.load.spritesheet('castle', 'castle-damage.png', { frameWidth: 256, frameHeight: 256 });

        this.load.spritesheet('bat-0', './menu/bat-0.png', { frameWidth: 32, frameHeight: 32 });

        this.load.spritesheet('coin', 'coin.png', { frameWidth: 32, frameHeight: 32 });
        
        // Blue King
        this.load.spritesheet('blue-king-idle', './characters/blue-king/idle.png', { frameWidth: 160, frameHeight: 111 });
        this.load.spritesheet('blue-king-walk', './characters/blue-king/walk.png', { frameWidth: 160, frameHeight: 111 });
        this.load.spritesheet('blue-king-attack', './characters/blue-king/attack-0.png', { frameWidth: 160, frameHeight: 111 });
        this.load.spritesheet('blue-king-death', './characters/blue-king/death.png', { frameWidth: 160, frameHeight: 111 });

        // Skeleton
        this.load.spritesheet('skeleton-idle', './characters/skeleton/idle.png', { frameWidth: 150, frameHeight: 150 });
        this.load.spritesheet('skeleton-walk', './characters/skeleton/walk.png', { frameWidth: 150, frameHeight: 150 });
        this.load.spritesheet('skeleton-attack', './characters/skeleton/attack.png', { frameWidth: 150, frameHeight: 150 });
        this.load.spritesheet('skeleton-death', './characters/skeleton/death.png', { frameWidth: 150, frameHeight: 150 });

        // Elf Archer
        this.load.spritesheet('elf-archer-idle', './characters/elf-archer/idle.png', { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet('elf-archer-walk', './characters/elf-archer/walk.png', { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet('elf-archer-attack', './characters/elf-archer/attack.png', { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet('elf-archer-death', './characters/elf-archer/death.png', { frameWidth: 100, frameHeight: 100 });
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('AutoRpg');
    }
}
