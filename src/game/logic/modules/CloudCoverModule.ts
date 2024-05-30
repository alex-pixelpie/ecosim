import {createNoise2D, createNoise3D} from "simplex-noise";
import {MathUtils} from "../../utils/Math.ts";
import {GameLogic, GameLogicModule, GameSystem, ValueComponent} from "../GameLogic.ts";
import {TilesModule} from "./TilesModule.ts";
import {EventBus, UiEvents} from "../../EventBus.ts";
import Vector2 = Phaser.Math.Vector2;
import Tile = TilesModule.Tile;
import {Entity} from "../../core/ECS.ts";
import {PhysicsModule} from "./PhysicsModule.ts";

export namespace CloudCoverModule {
    import Position = PhysicsModule.Position;

    export class TilesCloudCoverModule extends GameLogicModule {
        override init(game: GameLogic) {
            const entities = game.ecs.getEntitiesWithComponents([Tile]);

            entities.forEach(entity => {
                game.ecs.addComponent(entity, new CloudCover(0));
            });
            
            const system = new CloudsCoverSystem(game);
            game.ecs.addSystem(system);
        }
    }

    export class CloudCover extends ValueComponent{}

    export class CloudsCoverConfig {
        thicknessSize = 50;
        windSize = 150;
        windStrength = 0.1;
        rotationSpeed = 0.1;
        cloudsChangeSpeed = 1;
        coverCutoff = 0.5;
        speedFactor = 1;
    }
    
    class CloudsCoverSystem extends GameSystem {
        override componentsRequired: Set<Function> = new Set([Position, CloudCover]);

        thicknessNoise = createNoise3D();
        windNoise = createNoise2D();

        config = new CloudsCoverConfig();
        
        offset = new Vector2(0,0);
        windNoisePosition = new Vector2(Math.random(),Math.random());
        
        constructor(public game: GameLogic) {
            super(game);
            EventBus.on(UiEvents.WindConfigUpdated, (config: CloudsCoverConfig) => {
                this.config = config;
            });
        }
        
        protected init(): void {
            this.componentsRequired = new Set([Position, CloudCover]);
            this.game.ecs.addSystem(this);
            
            const config = new CloudsCoverConfig();
            this.config = config;
            EventBus.emit(UiEvents.WindConfigCreated, config);
        }
        
        updateWind(time: number, delta: number){
            if (!this.config.windSize || !this.config.windStrength || !this.config.speedFactor) {
                return;
            }
            
            let windNoise = MathUtils.remapNoiseToUnit(this.windNoise(time / this.config.windSize * this.config.speedFactor, 0));
            this.windNoisePosition.setLength(this.config.windStrength * MathUtils.remapNoiseToUnit(this.windNoise(time / this.config.windSize * this.config.speedFactor, 0)) * this.config.speedFactor);
            
            if (this.config.rotationSpeed)
                this.windNoisePosition.rotate((windNoise * 180 * this.config.rotationSpeed * delta)* this.config.speedFactor);

            this.offset.x += this.windNoisePosition.x;
            this.offset.y += this.windNoisePosition.y;
        }

        public update(entities: Set<Entity>, delta: number): void {
            this.updateWind(this.game.timeFromStart, delta);
            
            if (!this.config.thicknessSize || !this.config.cloudsChangeSpeed || !this.config.speedFactor) {
                return;
            }
            
            entities.forEach(entity => {
                const position = this.game.ecs.getComponent(entity, Position);
                const cloudCover = this.game.ecs.getComponent(entity, CloudCover);
                let offset = this.offset;

                cloudCover.value =  Math.min(MathUtils.remapNoiseToUnit(this.thicknessNoise((position.y+offset.y) / this.config.thicknessSize, (position.x+offset.x) / this.config.thicknessSize, this.game.timeFromStart * this.config.cloudsChangeSpeed * this.config.speedFactor)), 1);

                if (cloudCover.value < this.config.coverCutoff) {
                    cloudCover.value = 0;
                }
            });
        }
    }
}