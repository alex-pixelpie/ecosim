import {GameLogic, GameLogicModule, GameSystem, ValueComponent} from "../GameLogic.ts";
import {Component, ECS, Entity} from "../../core/ECS.ts";

export namespace PhysicsModule {
    export class PhysicalObject extends Component {}
    
    export class Illumination extends ValueComponent{}
    
    export class Temperature extends ValueComponent{}

    export class Position extends Component {
        constructor(public x: number,
                    public y: number){
            super();
        }
    }

    export class IlluminationResetSystem extends GameSystem {
        public componentsRequired: Set<Function> = new Set([Illumination]);

        public update(entities: Set<Entity>, _: number): void {
            entities.forEach(entity => {
                const illumination = this.game.ecs.getComponent(entity, Illumination);
                illumination.value = 0;
            });
        }

        protected init(): void {
            this.componentsRequired = new Set([Illumination]);
            this.game.ecs.addSystem(this);
        }
    }
    
    export function addPhysicalComponents(ecs:ECS, entity:Entity, position: {x: number, y: number} = {x: 0, y: 0}) {
        ecs.addComponent(entity, new PhysicalObject());
        ecs.addComponent(entity, new Illumination(0));
        ecs.addComponent(entity, new Temperature(0));
        ecs.addComponent(entity, new Position(position.x, position.y));
    }
    
    export class PhysicsModule extends GameLogicModule {
        override init(game: GameLogic) {
            const illuminationResetSystem = new IlluminationResetSystem(game);
            game.ecs.addSystem(illuminationResetSystem);
        }
    }
}