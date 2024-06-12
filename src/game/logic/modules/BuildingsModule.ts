import {GameLogic, GameLogicModule, GameSystem} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";
import {Group, Targetable} from "./Targeting.ts";
import {Dead, DieAndDrop, DropType, Health} from "./DeathModule.ts";
import {EventBus, GameEvents} from "../../EventBus.ts";
import {FrameLog} from "./FrameLog.ts";

export enum BuildingType {
    Base = "Base"
}

export class Building extends Component {
    constructor(public type: BuildingType = BuildingType.Base) {
        super();
    }
}

class BuildingsDeathSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Building]);
    
    protected init(): void {
        this.componentsRequired = new Set([Building]);
    }
    
    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const health = this.game.ecs.getComponent<Health>(entity, Health);
             
            if (health.value <= 0){
                this.game.ecs.addComponent(entity, new Dead());

                const group = this.game.ecs.getComponent(entity, Group);
                const victory = !!(group.id === 0 ? 1 : 0);
                
                EventBus.emit(GameEvents.GameOver, {victory});
            }
        });
    }
}

export class BuildingsModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const basesSystem = new BuildingsDeathSystem(game);
        game.ecs.addSystem(basesSystem);

        const mapSize = game.config.tilesInMapSide * 32; // TODO - get value from config
        const offset = 100;
        const baseSize = 140;
        const hBaseSize = baseSize/2;
        
        const enemyBase = game.ecs.addEntity();
        game.ecs.addComponent(enemyBase, new Building());
        game.ecs.addComponent(enemyBase, new DieAndDrop([{type: DropType.Ruin}]));
        game.ecs.addComponent(enemyBase, new Health(1000));
        game.ecs.addComponent(enemyBase, new Group(0));
        game.ecs.addComponent(enemyBase, new Targetable());
        game.ecs.addComponent(enemyBase, new FrameLog.FrameLog());
        game.addPhysicalComponents({entity: enemyBase, x: offset+hBaseSize, y: offset+hBaseSize, width: baseSize, height: baseSize, isStatic: true});

        const playerBase = game.ecs.addEntity();
        game.ecs.addComponent(playerBase, new Building());
        game.ecs.addComponent(playerBase, new DieAndDrop([{type: DropType.Ruin}]));
        game.ecs.addComponent(playerBase, new Health(1000));
        game.ecs.addComponent(playerBase, new Group(1));
        game.ecs.addComponent(playerBase, new Targetable());
        game.ecs.addComponent(playerBase, new FrameLog.FrameLog());
        game.addPhysicalComponents({entity: playerBase, x: mapSize-offset-hBaseSize, y: mapSize-offset-hBaseSize, width: baseSize, height: baseSize, isStatic: true});

    }
}