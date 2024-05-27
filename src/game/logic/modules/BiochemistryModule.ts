import {GameLogic, GameLogicModule, GameSystem, ValueComponent} from "../GameLogic.ts";
import {Component, Entity} from "../../core/ECS.ts";

export namespace BiochemistryModule {
    export enum ChemicalElement {
        Glucose = 'Glucose',
    }

    export class Photosynthesis extends ValueComponent {}

    export class BiochemicalBalance extends Component {
        public balance: Record<ChemicalElement, number> = {
            Glucose: 0,
        };
    }

    export class PhotosynthesisSystem extends GameSystem {
        public componentsRequired: Set<Function> = new Set([BiochemicalBalance, Photosynthesis]);

        protected init(): void {
            this.componentsRequired = new Set([BiochemicalBalance, Photosynthesis]);
            this.game.ecs.addSystem(this);
        }

        public update(entities: Set<Entity>, delta: number): void {
            entities.forEach(entity => {
                const biochemicalBalance = this.game.ecs.getComponent(entity, BiochemicalBalance);
                const photosynthesis = this.game.ecs.getComponent(entity, Photosynthesis);
                let glucose = photosynthesis.value * delta;
                biochemicalBalance.balance[ChemicalElement.Glucose] += glucose;

                // TODO - implement and consider sunlight / luminosity
            });
        }
    }

    export class BiochemistryModule extends GameLogicModule {
        override init(game: GameLogic) {
            const system = new PhotosynthesisSystem(game);
            game.ecs.addSystem(system);
        }
    }
}