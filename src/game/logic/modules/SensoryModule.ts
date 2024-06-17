import {GameLogic, GameSystem} from "../GameLogic.ts";
import {GameLogicModule} from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {MathUtils} from "../../utils/Math.ts";

export class Senses extends Component {
    public entitiesInRange: number[] = [];

    public constructor(public range: number) {
        super();
    }
}

class SensorySystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Senses, Position]);

    protected init(): void {
        this.componentsRequired = new Set([Senses, Position]);
    }

    public update(entities: Set<number>, _: number): void {
            entities.forEach(entity => {
            const senses = this.game.ecs.getComponent(entity, Senses);
            const position = this.game.ecs.getComponent(entity, Position);

            senses.entitiesInRange = [];
            
            this.game.ecs.getEntitiesWithComponents([Position]).forEach(otherEntity => {
                if (entity === otherEntity) {
                    return;
                }
                const otherPosition = this.game.ecs.getComponent(otherEntity, Position);
                if (!otherPosition) {
                    return;
                }
                
                const distance = MathUtils.distance(position, otherPosition);
                if (distance < senses.range) {
                    senses.entitiesInRange.push(otherEntity);
                }
            });
        });
    }
}

export class SensoryModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const sensorySystem = new SensorySystem(game);
        game.ecs.addSystem(sensorySystem);
    }
    
}