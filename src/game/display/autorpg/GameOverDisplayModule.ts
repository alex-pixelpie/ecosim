import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay, GameOverAgentData} from "./AutoRpgDisplay.ts";
import Sprite = Phaser.GameObjects.Sprite;
import {Shadow} from "./effects/Shadow.ts";

class GameOverAgentView {
    public id: number;
    public view: Sprite;
    private shadow: Shadow;
    
    constructor(display: AutoRpgDisplay, agent: GameOverAgentData){
        this.id = agent.id;
        this.view = display.scene.add.sprite(agent.x, agent.y, 'bat-0');
        display.air.add(this.view);
        this.view.setFrame(Math.floor(Math.random() * 4));
        this.shadow = new Shadow(display, 0.5, false);
        this.shadow.update(this.view);
    }
    
    public update(agent: GameOverAgentData){
        this.view.x = agent.x;
        this.view.y = agent.y;
        this.view.anims.play('fly', true);
        this.shadow.update(this.view);
    }
    
    public destroy(){
        this.view.destroy();
        this.shadow.destroy();
    }
}

export class GameOverDisplayModule extends DisplayModule<AutoRpgDisplay> {
    private display: AutoRpgDisplay;
    private gameOverAgents = new Map<number, GameOverAgentView>();
    
    public init(display: AutoRpgDisplay): void {
        this.display = display;

        display.scene.anims.create({
            key: 'fly',
            frames: display.scene.anims.generateFrameNumbers('bat-0', {start: 0, end: 3}),
            frameRate: 12,
            repeat: -1
        });
    }
    
    public update(_: number): void {
        this.gameOverAgents.forEach((view, entity) => {
            if (!this.display.gameOverAgents.find(data => data.id === entity)) {
                view.destroy();
                this.gameOverAgents.delete(entity);
            }
        });

        this.display.gameOverAgents.forEach(agent => {
            let view = this.gameOverAgents.get(agent.id);
            if (!view) {
                view = new GameOverAgentView(this.display, agent);
                this.gameOverAgents.set(agent.id, view);
            }
            view.update(agent);
        });
    }
}