import {GameLogic, GameSystem} from "../GameLogic.ts";
import {GameLogicModule } from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {Dead, Health} from "./DeathModule.ts";
import {BuildingType} from "../../configs/BuildingsConfig.ts";

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
                
                // TODO - handle this
            }
        });
    }
}

export class BuildingsModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const basesSystem = new BuildingsDeathSystem(game);
        game.ecs.addSystem(basesSystem);
    }
}