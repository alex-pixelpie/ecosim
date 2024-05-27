import {Component, Entity} from "../../core/ECS.ts";
import {GameLogic, GameLogicModule, GameSystem} from "../GameLogic.ts";
import {TilesSurfaceMoistureModule} from "./TilesSurfaceMoistureModule.ts";
import SurfaceMoisture = TilesSurfaceMoistureModule.SurfaceMoisture;
import {BiochemistryModule} from "./BiochemistryModule.ts";

export namespace PlantsModule {
    import BiochemicalBalance = BiochemistryModule.BiochemicalBalance;
    import ChemicalElement = BiochemistryModule.ChemicalElement;

    export enum PlantSpecies {
        Grass = 'Grass',
        Seaweed = 'Seaweed',
    }
    
    class PlantSpeciesConfig {
        conditions: Record<string, {min: number, max: number}>;
        costToGrow: Record<ChemicalElement, number>;
        // TODO - add plant growth plan
        // TODO - add plant aging
    }
    
    const grassConfig:PlantSpeciesConfig = {
        conditions: {
            [SurfaceMoisture.name]: {min:0, max:0}
        },
        costToGrow:{
            [ChemicalElement.Glucose]: 1
        }
    }
    
    const seaweedConfig:PlantSpeciesConfig = {
        conditions: {
            [SurfaceMoisture.name]: {min:1000, max:3000}
        },
        costToGrow:{
            [ChemicalElement.Glucose]: 1
        }
    }
    
    const plantsConfigs: Record<PlantSpecies, PlantSpeciesConfig> = {
        [PlantSpecies.Grass]: grassConfig,
        [PlantSpecies.Seaweed]: seaweedConfig,
    }
    
    export class Plant extends Component {
        constructor(public type: PlantSpecies) {
            super();
        }
    }

    export class PlantBody extends Component {
        public config: PlantSpeciesConfig;
        public radiiByHeight: number[] = [];
        public volume = this.radiiByHeight.reduce((acc, r) => acc + r*r, 0);
        public height = this.radiiByHeight.length;
        public groundSize = this.radiiByHeight?.[0] ?? 0;
    }
    
    export class PlantsGrowSystem extends GameSystem {
        public componentsRequired: Set<Function> = new Set([PlantBody, BiochemicalBalance]);
        
        protected init(): void {
            this.componentsRequired = new Set([PlantBody, BiochemicalBalance]);
            this.game.ecs.addSystem(this);
        }
        
        public update(entities: Set<Entity>, delta: number): void {
            entities.forEach(entity => {
                const plantBody = this.game.ecs.getComponent(entity, PlantBody);
                const biochemicalBalance = this.game.ecs.getComponent(entity, BiochemicalBalance);

                // TODO - get tile moisture by position --> how to get tile efficiently?
                // TODO - consider min/max conditions for plant growth
                // TODO - implement and consider plant growth plan
                // TODO - pay plant growth cost
            });
        }
    }
    
    export class PlantsModule extends GameLogicModule {
        override init(game: GameLogic) {
            game.config.plants = plantsConfigs;
        }
    }
}