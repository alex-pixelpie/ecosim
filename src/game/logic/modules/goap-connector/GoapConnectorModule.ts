import {GameLogic} from "../../GameLogic.ts";
import { GameLogicModule } from "../../GameLogicModule.ts";
import { GoapStateUpdateSystem } from "./systems/GoapStateUpdateSystem.ts";
import {GoapActionProcessorSystem} from "./systems/GoapActionProcessorSystem.ts";
import {Component} from "../../../core/ECS.ts";
import {MathUtils, Pos} from "../../../utils/Math.ts";
import {PatrolConfig} from "../../../configs/MobsConfig.ts";

export class Patrol extends Component {
    public lastPatrolEndTime: number = 0;
    public onPatrol: boolean = false;
    public patrolTarget:Pos = {x: 0, y: 0};
    private readonly currentFrequency: number = 0;

    constructor(public config:PatrolConfig, public ownRadius:number) {
        super();
        this.currentFrequency = config.maxFrequency + Math.random() * (config.minFrequency - config.maxFrequency);
    }

    public startPatrol(patrolTarget: Pos, currentTime: number){
        this.patrolTarget = patrolTarget;
        this.lastPatrolEndTime = currentTime;
        this.onPatrol = true;
    }

    public endPatrol(){
        this.onPatrol = false;
    }

    public canGoPatrol(currentTime: number): boolean {
        return this.lastPatrolEndTime + this.currentFrequency < currentTime;
    }

    inRange(from: Pos): boolean {
        let distance = MathUtils.distance(from, this.patrolTarget) - this.config.targetRadius - this.ownRadius;
        return distance <= 0;
    }
}

export class GoapConnectorModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const goapToSteeringDesiresSystem = new GoapActionProcessorSystem(game);
        game.ecs.addSystem(goapToSteeringDesiresSystem);
        
        const goapStateUpdateSystem = new GoapStateUpdateSystem(game);
        game.ecs.addSystem(goapStateUpdateSystem);
    }
}