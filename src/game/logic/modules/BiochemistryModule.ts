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

    export class Photosynthesis extends ValueComponent {}

    export class Biomass extends ValueComponent {}
    
    export class ChanceOfDeath extends ValueComponent {}

    export class BiologicalAge extends ClampedValueComponent {}
    
    export class DeathReport {
        public constructor(public reason: string, public biochemicalBalance:BiochemicalBalance, public age:BiologicalAge) {}
    }

    export class Death extends Component {
        public constructor(public deathReport: DeathReport) {
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
                
                // TODO - implement seeds and reproduction
                // TODO - use white art and tint to show plant status
                
                // TODO - implement wind
                // TODO - implement clouds

                // TODO - implement and consider sunlight / luminosity

                // TODO - implement rain
                // TODO - implement super simple drainage
                //      - if have surface moisture, and any neighbor has less elevation, move moisture to that neighbor
                // TODO - implement super simple evaporation
                // TODO - implement super simple diffusion
                // TODO - implement and consider H2O costs. Associated systems -> PlantWaterUptakeSystem

                // TODO - consider shade and radius of plant at each level
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

    export class ChanceOfDeathResetSystem extends TimedGameSystem {
        public componentsRequired: Set<Function> = new Set([ChanceOfDeath]);

        protected init(): void {
            this.componentsRequired = new Set([ChanceOfDeath]);
            this.game.ecs.addSystem(this);
        }

        protected updateTimed(entities: Set<Entity>, _: number): void {
            entities.forEach(entity => {
                const chanceOfDeath = this.game.ecs.getComponent(entity, ChanceOfDeath);
                chanceOfDeath.value = 0;
            });
        }
    }

    export class ChanceOfDeathByOldAgeSystem extends TimedGameSystem {
        public componentsRequired: Set<Function> = new Set([BiologicalAge, ChanceOfDeath]);

        protected updateTimed(entities: Set<Entity>, _: number): void {
            entities.forEach(entity => {
                const age = this.game.ecs.getComponent(entity, BiologicalAge);
                const normalizedAge = age.value / age.max;
                const exponentialScale = Math.exp(deathChanceByAgeExponent * normalizedAge) - 1;
                const normalizedChanceOfDeath = exponentialScale / (Math.exp(deathChanceByAgeExponent) - 1);
                this.game.ecs.getComponent(entity, ChanceOfDeath).value += normalizedChanceOfDeath;
            });
        }

        protected init(): void {
            this.componentsRequired = new Set([BiologicalAge]);
            this.game.ecs.addSystem(this);
        }
    }
    
    export class DeathSystem extends TimedGameSystem {
        public componentsRequired: Set<Function> = new Set([ChanceOfDeath]);

        protected updateTimed(entities: Set<Entity>, _: number): void {
            entities.forEach(entity => {
                const chanceOfDeath = this.game.ecs.getComponent(entity, ChanceOfDeath);
                if (Math.random() < chanceOfDeath.value) {
                    this.game.ecs.addComponent(entity, new Death(this.makeDeathReport(entity)));
                    this.game.ecs.removeComponent(entity, ChanceOfDeath);
                    this.game.ecs.removeComponent(entity, BiologicalAge);
                    this.game.ecs.removeComponent(entity, BiochemicalBalance);
                    this.game.ecs.removeComponent(entity, Photosynthesis);
                }
            });
        }
        
        private makeDeathReport(entity: Entity): DeathReport {
            const b = this.game.ecs.getComponent(entity, BiochemicalBalance);
            const a = this.game.ecs.getComponent(entity, BiologicalAge);
            return new DeathReport('Natural causes', new BiochemicalBalance((b? {...b.balance} : {}) as Record<ChemicalElement, number>), new BiologicalAge(a?.min || 0, a?.max || 0, a?.value || 0));
        }

        protected init(): void {
            this.componentsRequired = new Set([ChanceOfDeath]);
            this.game.ecs.addSystem(this);
        }
    }

    export class DecaySystem extends TimedGameSystem {
        public componentsRequired: Set<Function> = new Set([Death, Biomass]);

        protected updateTimed(entities: Set<Entity>, delta: number): void {
            entities.forEach(entity => {
                const biomass = this.game.ecs.getComponent(entity, Biomass);
                biomass.value -= this.game.config.biologicalDecayRatePerSecond * delta;
                if (biomass.value <= 0) {
                    this.game.ecs.removeEntity(entity);
                }
            });
        }

        protected init(): void {
            this.componentsRequired = new Set([Death, Biomass]);
            this.game.ecs.addSystem(this);
        }
    }


    const lifecycleUpdateInterval = 1;
    const deathChanceByAgeExponent = 10; // Adjust this value to control the steepness of the curve
    // TODO - add biochemistry configs and put deathChanceByAgeExponent in the config

    export class BiochemistryModule extends GameLogicModule {
        override init(game: GameLogic) {
            const chanceOfDeathResetSystem = new ChanceOfDeathResetSystem(game, lifecycleUpdateInterval);
            game.ecs.addSystem(chanceOfDeathResetSystem);
            
            const photosynthesisSystem = new PhotosynthesisSystem(game);
            game.ecs.addSystem(photosynthesisSystem);
            
            const ageSystem = new AgeSystem(game, lifecycleUpdateInterval);
            game.ecs.addSystem(ageSystem);

            const deathByOldAgeSystem = new ChanceOfDeathByOldAgeSystem(game, lifecycleUpdateInterval);
            game.ecs.addSystem(deathByOldAgeSystem);
            
            const deathSystem = new DeathSystem(game, lifecycleUpdateInterval);
            game.ecs.addSystem(deathSystem);
            
            const decaySystem = new DecaySystem(game, lifecycleUpdateInterval);
            game.ecs.addSystem(decaySystem);
        }
    }
}