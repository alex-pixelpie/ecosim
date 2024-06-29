import {Component} from "../../core/ECS.ts";
import {GameLogic, GameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Steering} from "./SteeringModule.ts";
import {MathUtils} from "../../utils/Math.ts";
import {PhysicsBody} from "./PhaserPhysicsModule.ts";

export class GlideLocomotion extends Component {
    speed: number;
    maxSpeed: number;
    
    constructor(speed: number = 1) {
        super();
        this.speed = speed;
        this.maxSpeed = speed;
    }
}

export class GlideLocomotionSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([GlideLocomotion, Steering, PhysicsBody]);

    protected init(): void {
        this.componentsRequired = new Set([GlideLocomotion, Steering, PhysicsBody]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const body = this.game.ecs.getComponent(entity, PhysicsBody);
            if (!body) {
                return;
            }

            const moveDesires = this.game.ecs.getComponent(entity, Steering);
            if (!moveDesires || moveDesires.impulses.length === 0) {
                body.body.setVelocity(0, 0);
                return;
            }
            
            const locomotion = this.game.ecs.getComponent(entity, GlideLocomotion);
            if (!locomotion) {
                body.body.setVelocity(0, 0);
                return;
            }
            
            const directions = moveDesires.impulses.reduce((acc, desire) => {
                const normalized = desire;
                acc.x += normalized.x;
                acc.y += normalized.y;
                return acc;
            }, { x: 0, y: 0 });
            
            const direction = MathUtils.normalize(directions);

            body.body.setVelocity(direction.x * locomotion.speed, direction.y * locomotion.speed);
        });
    }
}

export class LocomotionModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const locomotionSystem = new GlideLocomotionSystem(game);
        game.ecs.addSystem(locomotionSystem);
    }
}