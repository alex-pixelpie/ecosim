import {
    ClampedValueComponent,
    GameLogic,
    GameLogicModule,
    GameSystem,
    TimedGameSystem,
    ValueComponent
} from "../GameLogic.ts";
import {Component, Entity} from "../../core/ECS.ts";

export namespace BiochemistryModule {

    export enum ChemicalElement {
        Glucose = 'Glucose',
    }

    export class Photosynthesis extends ValueComponent {
        public constructor(public value: number) {
            super(value);
        }
    }

    export class BiologicalAge extends ClampedValueComponent {}

    export class Death extends Component {
        public constructor(public reason: string) {
            super();
        }
    }
    
    export class BiochemicalBalance extends Component {
        constructor(public balance: Record<ChemicalElement, number> = {
            Glucose: 0,
        }) {
            super();
        }
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
                // TODO - implement and consider H2O costs. Associated systems -> PlantWaterUptakeSystem
                // TODO - consider shade and radius of plant at each level
                // TODO - improve plant death system
            });
        }
    }
    
    export class AgeSystem extends TimedGameSystem {
        public componentsRequired: Set<Function> = new Set([BiologicalAge]);

        protected init(): void {
            this.componentsRequired = new Set([BiologicalAge]);
            this.game.ecs.addSystem(this);
        }

        protected updateTimed(entities: Set<Entity>, delta: number): void {
            entities.forEach(entity => {
                const age = this.game.ecs.getComponent(entity, BiologicalAge);
                age.value += delta;
            });
        }
    }

    export class DeathByOldAgeSystem extends TimedGameSystem {
        public componentsRequired: Set<Function> = new Set([BiologicalAge]);
        
        protected updateTimed(entities: Set<Entity>, _: number): void {
            entities.forEach(entity => {
                const age = this.game.ecs.getComponent(entity, BiologicalAge);
                const chanceOfDeath = age.value / age.max;
                if (Math.random() < chanceOfDeath) {
                    this.game.ecs.addComponent(entity, new Death('Old age'));
                }
            });
        }

        protected init(): void {
            this.componentsRequired = new Set([BiologicalAge]);
            this.game.ecs.addSystem(this);
        }
    }

    const lifecycleUpdateInterval = 10;
    
    export class BiochemistryModule extends GameLogicModule {
        override init(game: GameLogic) {
            const photosynthesisSystem = new PhotosynthesisSystem(game);
            game.ecs.addSystem(photosynthesisSystem);
            
            const ageSystem = new AgeSystem(game, lifecycleUpdateInterval);
            game.ecs.addSystem(ageSystem);
            
            const deathByOldAgeSystem = new DeathByOldAgeSystem(game, lifecycleUpdateInterval);
            game.ecs.addSystem(deathByOldAgeSystem);
        }
    }
}