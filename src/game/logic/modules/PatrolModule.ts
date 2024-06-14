import {GameLogicModule} from "../GameLogicModule.ts";
import {GameLogic, TimedGameSystem} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";
import {MathUtils, Pos} from "../../utils/Math.ts";
import {PatrolConfig} from "../../configs/MobsConfig.ts";
import {Position} from "./PhaserPhysicsModule.ts";

export class Patrol extends Component {
    constructor(public homeSize: number, public ownSize: number, public maxDistance: number, public x: number, public y: number) {
        super();
    }

    distance(from: Pos): number {
        return MathUtils.distance(from, this) - this.homeSize;
    }

    inRange(from: Pos): boolean {
        let distance = MathUtils.distance(from, this) - this.ownSize - this.homeSize;
        return distance <= this.maxDistance;
    }
}

export class Patroller extends Component {
    public lastPatrolEndTime: number = 0;
    private readonly currentFrequency: number = 0;
    
    constructor(public config:PatrolConfig) {
        super();
        this.currentFrequency = config.maxFrequency + Math.random() * (config.minFrequency - config.maxFrequency);
    }
    
    public canGoPatrol(currentTime: number): boolean {
        return this.lastPatrolEndTime + this.currentFrequency < currentTime;
    }
}

class PatrolSystem extends TimedGameSystem {
    public componentsRequired: Set<Function> = new Set([Patroller]);

    protected init(): void {
        this.componentsRequired = new Set([Patroller]);
    }

    protected updateTimed(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const patroller = this.game.ecs.getComponent(entity, Patroller);
            const position = this.game.ecs.getComponent(entity, Position);
            
            if (!patroller || !position){
                return;
            }
            
            const patrol = this.game.ecs.getComponent(entity, Patrol);
            if (patrol && !patrol.inRange(position)){
                return;
            }

            this.game.ecs.removeComponent(entity, Patrol);

            if (!patroller.canGoPatrol(this.game.currentTime)) {
                return;
            }
            
            const target = MathUtils.randomPointOnCircumference(patroller.config.targetPosition, patroller.config.targetRadius);
            
            this.game.ecs.addComponent(entity, new Patrol(0, 0, 20, target.x, target.y));
        });
    }
}

const patrolUpdateInterval = 5;

export class PatrolModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const patrolSystem = new PatrolSystem(game, patrolUpdateInterval);
        game.ecs.addSystem(patrolSystem);
        
        const patrollers = new Set<number>(game.ecs.getEntitiesWithComponents([Patroller]));
        patrolSystem.update(patrollers, 5000);
    }
}