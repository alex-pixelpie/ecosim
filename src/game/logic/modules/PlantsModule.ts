import {Component, Entity} from "../../core/ECS.ts";
import {GameLogic, GameLogicModule, GameSystem, ValueComponent} from "../GameLogic.ts";
import {TilesSurfaceMoistureModule} from "./TilesSurfaceMoistureModule.ts";
import SurfaceMoisture = TilesSurfaceMoistureModule.SurfaceMoisture;
import {BiochemistryModule} from "./BiochemistryModule.ts";

import BiologicalAge = BiochemistryModule.BiologicalAge;
import Photosynthesis = BiochemistryModule.Photosynthesis;
import ChemicalElement = BiochemistryModule.ChemicalElement;
import BiochemicalBalance = BiochemistryModule.BiochemicalBalance;
import {PhysicsModule} from "./PhysicsModule.ts";

type ComponentGetter = (game:GameLogic, entity:Entity)=>ValueComponent;
type TileCondition = {valueComponentName: string, min: number, max: number};

const componentGetters:Record<string, ComponentGetter> = {
    [SurfaceMoisture.name]: (game, entity) => game.ecs.getComponent(entity, TilesSurfaceMoistureModule.SurfaceMoisture),
}

type PlantGrowthStage = {
    radii: number[]; // radii of each layer
    age: number; // age of the plant
}

export namespace PlantsModule {
    import Position = PhysicsModule.Position;

    export enum PlantSpecies {
        Grass = 'Grass',
        Seaweed = 'Seaweed',
    }
    
    class PlantSpeciesConfig {
        type: PlantSpecies;
        tileConditions: TileCondition[];
        costToGrow: {element: ChemicalElement, cost: number}[];
        plantGrowthPlan: PlantGrowthStage[]; // ordered by age desc
        growthRate: number;
        maxAge: number;
        photosynthesisEfficiency: number;
    }
    
    const grassConfig:PlantSpeciesConfig = {
        type: PlantSpecies.Grass,
        tileConditions: [{
            valueComponentName: SurfaceMoisture.name, min: 0, max: 0
        }],
        costToGrow: [{
            element: ChemicalElement.Glucose, cost: 1000
        }],
        plantGrowthPlan: [
            {radii: [10], age: 0},
        ],
        growthRate: 1,
        maxAge: Number.MAX_VALUE,
        photosynthesisEfficiency: 100
    }
    
    const seaweedConfig:PlantSpeciesConfig = {
        type: PlantSpecies.Seaweed,
        growthRate: 1,
        tileConditions: [{
            valueComponentName: SurfaceMoisture.name, min: 1000, max: 3000
        }],
        costToGrow: [{
            element: ChemicalElement.Glucose, cost: 1000
        }],
        plantGrowthPlan: [
            {radii: [10, 10], age: 40},
            {radii: [5], age: 0},
        ],
        maxAge: 100,
        photosynthesisEfficiency: 100
    }
    
    const plantsConfigs: Record<PlantSpecies, PlantSpeciesConfig> = {
        [PlantSpecies.Grass]: grassConfig,
        [PlantSpecies.Seaweed]: seaweedConfig,
    }
    
    export class Plant extends Component {}

    export class PlantBody extends Component {
        public radiiByHeight: number[] = [];
        get volume(){return this.radiiByHeight.reduce((acc, r) => acc + r*r, 0)};
        get height(){return this.radiiByHeight.length};
        get groundSize(){return this.radiiByHeight?.[0] ?? 0};
        get photosynthesisSurface(){
            return this.radiiByHeight.reduce((acc, r) => acc + r, 0);
        }
        
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

                const bodyVolume = plantBody.volume;
                const growthRate = plantBody.config.growthRate * Math.max(1, bodyVolume);

                // Prepare to pay costs by considering volume needed (how much biomass are we adding) and seconds delta
                const maxVolumeNeeded = parseFloat((growthStage.radii.reduce((acc, r) => acc + r*r, 0)-bodyVolume).toPrecision(5));

                const volumeNeeded = Math.min(maxVolumeNeeded, growthRate * delta);
                
                if (volumeNeeded<=0) {
                    return;
                }

                // Pay costs
                const biochemicalBalance = this.game.ecs.getComponent(entity, BiochemicalBalance);

                const costs = plantBody.config.costToGrow.map(({element, cost}) => {
                    return {
                        element,
                        available: biochemicalBalance.balance[element],
                        cost: cost * volumeNeeded * delta
                    }
                });

                const anyCostNotMet = costs.some(cost => cost.available < cost.cost);

                if (anyCostNotMet) {
                    return;
                }

                costs.forEach(cost => biochemicalBalance.balance[cost.element] -= cost.cost);
                
                // Grow plant considering volume needed and seconds delta
                growthStage.radii.forEach((r, i) => {
                    if (isNaN(plantBody.radiiByHeight[i])){
                        plantBody.radiiByHeight[i] = 0;
                    }
                    const currentRadius = plantBody.radiiByHeight[i];
                    plantBody.radiiByHeight[i] += Math.min(growthRate, (r-currentRadius)) * delta;
                });
            });
        }
    }

    export class PlantsModule extends GameLogicModule {
        private game: GameLogic;
        override init(game: GameLogic) {
            this.game = game;
            
            game.config.plants = plantsConfigs;

            const plantGrowSystem = new PlantGrowSystem(game);
            game.ecs.addSystem(plantGrowSystem);
            
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
            const plantX = tilePosition.x * game.config.tileSize + Math.random() * game.config.tileSize;
            const plantY = tilePosition.y * game.config.tileSize + Math.random() * game.config.tileSize;
            
            game.ecs.addComponent(plantEntity, new Position(plantX, plantY));

            // Random plant species
            const plantSpecies = Math.random() < 0.5 ? PlantSpecies.Grass : PlantSpecies.Seaweed;
            const config = plantsConfigs[plantSpecies];
            game.ecs.addComponent(plantEntity, new PlantBody(config));
            game.ecs.addComponent(plantEntity, new BiologicalAge(0, 0, config.maxAge));
            game.ecs.addComponent(plantEntity, new Photosynthesis(config.photosynthesisEfficiency))

            // Give the seed enough glucose to grow to 10th of its volume in the first layer
            const startingBiochemicalBalance = {[ChemicalElement.Glucose]: 1000};
            game.ecs.addComponent(plantEntity, new BiochemicalBalance(startingBiochemicalBalance));
        }
    }
}