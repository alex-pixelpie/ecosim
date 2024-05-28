import {Component, Entity} from "../../core/ECS.ts";
import {GameLogic, GameLogicModule, GameSystem, ValueComponent} from "../GameLogic.ts";
import {TilesSurfaceMoistureModule} from "./TilesSurfaceMoistureModule.ts";
import SurfaceMoisture = TilesSurfaceMoistureModule.SurfaceMoisture;
import {BiochemistryModule} from "./BiochemistryModule.ts";
import BiochemicalBalance = BiochemistryModule.BiochemicalBalance;
import ChemicalElement = BiochemistryModule.ChemicalElement;
import {TilesModule} from "./TilesModule.ts";

type ComponentGetter = (game:GameLogic, entity:Entity)=>ValueComponent;
type TileCondition = {valueComponentName: string, min: number, max: number};

const componentGetters:Record<string, ComponentGetter> = {
    [SurfaceMoisture.name]: (game, entity) => game.ecs.getComponent(entity, TilesSurfaceMoistureModule.SurfaceMoisture),
}

const secondsInYear = 365 * 24 * 60 * 60;

type PlantGrowthStage = {
    radii: number[]; // radii of each layer
    age: number; // age of the plant
}

export namespace PlantsModule {
    import Position = TilesModule.Position;
    import BiologicalAge = BiochemistryModule.Age;
    import Photosynthesis = BiochemistryModule.Photosynthesis;

    export enum PlantSpecies {
        Grass = 'Grass',
        Seaweed = 'Seaweed',
    }
    
    class PlantSpeciesConfig {
        type: PlantSpecies;
        tileConditions: TileCondition[];
        costToGrow: {element: ChemicalElement, cost: number}[];
        plantGrowthPlan: PlantGrowthStage[]; // ordered by age desc
        maxAge: number;
        photosynthesisEfficiency: number;
    }
    
    const grassConfig:PlantSpeciesConfig = {
        type: PlantSpecies.Grass,
        tileConditions: [{
            valueComponentName: SurfaceMoisture.name, min: 0, max: 0
        }],
        costToGrow: [{
            element: ChemicalElement.Glucose, cost: 1
        }],
        plantGrowthPlan: [
            {radii: [10], age: 0},
        ],
        maxAge: Number.MAX_VALUE,
        photosynthesisEfficiency: 1
    }
    
    const seaweedConfig:PlantSpeciesConfig = {
        type: PlantSpecies.Seaweed,
        tileConditions: [{
            valueComponentName: SurfaceMoisture.name, min: 1000, max: 3000
        }],
        costToGrow: [{
            element: ChemicalElement.Glucose, cost: 0.5
        }],
        plantGrowthPlan: [
            {radii: [10, 10], age: secondsInYear / 6},
            {radii: [5], age: 0},
        ],
        maxAge: secondsInYear,
        photosynthesisEfficiency: 1
    }
    
    const plantsConfigs: Record<PlantSpecies, PlantSpeciesConfig> = {
        [PlantSpecies.Grass]: grassConfig,
        [PlantSpecies.Seaweed]: seaweedConfig,
    }
    
    export class Plant extends Component {}

    export class PlantBody extends Component {
        public radiiByHeight: number[] = [];
        public volume = this.radiiByHeight.reduce((acc, r) => acc + r*r, 0);
        public height = this.radiiByHeight.length;
        public groundSize = this.radiiByHeight?.[0] ?? 0;
        
        constructor(public config: PlantSpeciesConfig) {
            super();
        }
    }
    
    export class PlantGrowSystem extends GameSystem {
        public componentsRequired: Set<Function> = new Set([PlantBody, BiochemicalBalance, Position, BiologicalAge]);
        
        protected init(): void {
            this.componentsRequired = new Set([PlantBody, BiochemicalBalance, Position, BiologicalAge]);
            this.game.ecs.addSystem(this);
        }
        
        public update(entities: Set<Entity>, delta: number): void {
            entities.forEach(entity => {
                const plantBody = this.game.ecs.getComponent(entity, PlantBody);
                
                // Get growth stage
                const age = this.game.ecs.getComponent(entity, BiologicalAge);
                const growthStage = plantBody.config.plantGrowthPlan.find(stage => stage.age <= age.value);
                if (!growthStage) {
                    return;
                }

                // Check tile conditions
                const position = this.game.ecs.getComponent(entity, Position);
                const tile = this.game.mapPositionToTile(position);
                
                if (tile==null) {
                    console.error(`Plant without tile at position ${position.x}, ${position.y}`);
                    return;
                }
                
                const conditions = plantBody.config.tileConditions;
                const components = conditions.map(({valueComponentName}) => componentGetters[valueComponentName](this.game, tile));
                const anyConditionNotMet = conditions.some((condition, i) => {
                    const component = components[i];
                    return component.value < condition.min || component.value > condition.max;
                });
                if (anyConditionNotMet) {
                    return;
                }
                
                // Prepare to pay costs by considering volume needed (how much biomass are we adding), the conditions factor (how comfortable is the environment) and seconds delta
                const volumeNeeded = growthStage.radii.reduce((acc, r) => acc + r*r, 0) * delta;

                if (volumeNeeded==0) {
                    return;
                }
                
                const conditionsFactor = components.reduce((acc, component, i) => {
                    const {min, max} = conditions[i];
                    return acc + Math.max(0, Math.min(1, (component.value - min) / (max - min)));
                }, 0) / conditions.length;

                // Pay costs
                const biochemicalBalance = this.game.ecs.getComponent(entity, BiochemicalBalance);

                if (!this.PayPlanGrowthCosts(biochemicalBalance, plantBody, volumeNeeded, conditionsFactor, delta)) {
                    return;
                }
                
                // Grow plant
                growthStage.radii.forEach((r, i) => {
                    const currentRadius = plantBody.radiiByHeight[i] ?? 0;
                    plantBody.radiiByHeight[i] = Math.min(r, currentRadius + r * delta);
                });
                
            });
        }
        
        private PayPlanGrowthCosts(biochemicalBalance:BiochemicalBalance, plantBody:PlantBody, volumeNeeded:number, conditionsFactor:number, delta:number) : boolean {
            const costs = plantBody.config.costToGrow.map(({element, cost}) => {
                return {
                    element,
                    available: biochemicalBalance.balance[element],
                    cost: cost * volumeNeeded * conditionsFactor * delta
                }
            });

            const anyCostNotMet = costs.some(cost => cost.available < cost.cost);

            if (anyCostNotMet) {
                return false;
            }

            costs.forEach(cost => biochemicalBalance.balance[cost.element] -= cost.cost);

            return true;
        }
    }
    
    export class PlantsModule extends GameLogicModule {
        private game: GameLogic;
        override init(game: GameLogic) {
            this.game = game;
            
            game.config.plants = plantsConfigs;

            const system = new PlantGrowSystem(game);
            game.ecs.addSystem(system);
            
            this.createStartingPlants();
        }
        
        private createStartingPlants() {
            this.game.tiles.forEach(row => row.forEach(tileEntity => {
                let numPlants = Math.random() * 3;

                while (numPlants-- > 0){
                    this.createPlant(tileEntity);
                }
            }));
        }
        private createPlant(tileEntity:Entity) {
            const game = this.game;
            
            // Create plant entity and marker component
            const plantEntity = game.ecs.addEntity();
            game.ecs.addComponent(plantEntity, new Plant());
            
            // Position plant randomly in the tile
            const tilePosition = game.ecs.getComponent(tileEntity, Position);
            const plantX = tilePosition.x + Math.random() * game.config.tileSize;
            const plantY = tilePosition.y + Math.random() * game.config.tileSize;
            game.ecs.addComponent(plantEntity, new Position(plantX, plantY));

            // Random plant species
            const plantSpecies = Math.random() < 0.5 ? PlantSpecies.Grass : PlantSpecies.Seaweed;
            const config = plantsConfigs[plantSpecies];
            game.ecs.addComponent(plantEntity, new PlantBody(config));
            game.ecs.addComponent(plantEntity, new BiologicalAge(0, 0, config.maxAge));
            game.ecs.addComponent(plantEntity, new Photosynthesis(config.photosynthesisEfficiency))

            // Give the seed enough glucose to grow to half of its volume in the first layer
            const startingBiochemicalBalance = config.costToGrow.reduce((acc, {element, cost}) => {
                acc[element] = cost * config.plantGrowthPlan[config.plantGrowthPlan.length-1].radii.reduce((acc, r) => acc + r*r, 0) / 2;
                return acc;
            }, {} as Record<ChemicalElement, number>);

            game.ecs.addComponent(plantEntity, new BiochemicalBalance(startingBiochemicalBalance));
        }
    }
}