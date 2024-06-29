import {MathUtils, Pos} from "../../../utils/Math.ts";
import {PatrolConfig} from "../../../configs/MobsConfig.ts";
import {IUtilityBehavior, State} from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";
import {Position} from "../PhaserPhysicsModule.ts";
import {Steering} from "../SteeringModule.ts";
import {Component} from "../../../core/ECS.ts";

export class Patrol extends Component {
    public lastPatrolEndTime: number = 0;
    public onPatrol: boolean = false;
    public patrolTarget: Pos = { x: 0, y: 0 };
    private readonly currentFrequency: number = 0;

    constructor(public config: PatrolConfig, public ownRadius: number) {
        super();
        this.currentFrequency = config.maxFrequency + Math.random() * (config.minFrequency - config.maxFrequency);
    }

    public startPatrol(patrolTarget: Pos) {
        this.patrolTarget = patrolTarget;
        this.onPatrol = true;
    }

    public endPatrol(currentTime: number) {
        this.onPatrol = false;
        this.lastPatrolEndTime = currentTime;
    }

    public isOnCooldown(currentTime: number): boolean {
        const isCooldown = this.lastPatrolEndTime + this.currentFrequency > currentTime;
        return isCooldown;
    }

    inRange(from: Pos): boolean {
        let distance = MathUtils.distance(from, this.patrolTarget) - this.config.targetRadius - this.ownRadius;
        return distance <= 0;
    }
}

export class PatrolBehavior implements IUtilityBehavior {
    name: string = "Patrolling";
    getUtility(game: GameLogic, entity: number, state: State): number {
        const patrol = game.ecs.getComponent(entity, Patrol);
        if (!patrol || patrol.isOnCooldown(game.currentTime)) {
            return -1;
        }
        
        return state.patrolling ? 2 : 1;
    }
    
    execute(game: GameLogic, entity: number, state: State): void {
        const patrol = game.ecs.getComponent(entity, Patrol);

        if (!patrol) {
            return;
        }
        
        if (patrol.isOnCooldown(game.currentTime)) {
            return;
        }

        // Start patrolling if not already patrolling
        if (!patrol.onPatrol) {
            const target = MathUtils.randomPointOnCircumference(patrol.config.targetPosition, patrol.config.range);
            patrol.startPatrol(target);
        }
        
        const position = game.ecs.getComponent(entity, Position);
        if (!position) {
            return;
        }
        
        // End patrol if target reached
        if (patrol.inRange(position)){
            patrol.endPatrol(game.currentTime);
            return;
        }
        
        // Move towards target
        const steering = game.ecs.getComponent(entity, Steering);
        if (!steering) {
            return;
        }
        
        const vectorToTarget = MathUtils.normalize(MathUtils.subtract(patrol.patrolTarget, position));
        const impulseToTarget = MathUtils.multiply(vectorToTarget, 1);
        steering.impulses.push(impulseToTarget);
    }
    
    updateState(game: GameLogic, entity: number, state: State): void {
        state.patrolling = true;
    }
}
