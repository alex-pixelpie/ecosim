import {GameLogic, GameSystem} from "../GameLogic.ts";
import {GameLogicModule} from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {MathUtils} from "../../utils/Math.ts";
import {Targetable, TargetGroup, Targeting} from "./TargetingModule.ts";
import {Lootable} from "./LootModule.ts";

export class Senses extends Component {
    public enemies: number[] = [];
    public allies: number[] = [];
    public loot: number[] = [];
    public distances = new Map<number, number>();
    
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
        const game = this.game;
        
        entities.forEach(entity => {
            const senses = game.ecs.getComponent(entity, Senses);
            const position = game.ecs.getComponent(entity, Position);
            const targeting = game.ecs.getComponent(entity, Targeting);

            senses.enemies = [];
            senses.allies = [];
            senses.loot = [];
            senses.distances.clear();
            
            game.ecs.getEntitiesWithComponents([Position, Targetable]).forEach(otherEntity => {
                if (entity === otherEntity) {
                    return;
                }
                
                const otherPosition = game.ecs.getComponent(otherEntity, Position);
                if (!otherPosition) {
                    return;
                }
                
                const distance = MathUtils.distance(position, otherPosition);
                
                if (distance < senses.range) {
                    senses.distances.set(otherEntity, distance);

                    const targetGroup = game.ecs.getComponent(otherEntity, TargetGroup);
                    const bucket = targeting.targetGroups.has(targetGroup?.id) ? senses.enemies : senses.allies;
                    bucket.push(otherEntity);
                }
            });
            
            game.ecs.getEntitiesWithComponents([Position, Lootable]).forEach(otherEntity => {
                if (entity === otherEntity) {
                    return;
                }
                const otherPosition = game.ecs.getComponent(otherEntity, Position);
                if (!otherPosition) {
                    return;
                }
                
                const distance = MathUtils.distance(position, otherPosition);
                if (distance < senses.range) {
                    senses.loot.push(otherEntity);
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