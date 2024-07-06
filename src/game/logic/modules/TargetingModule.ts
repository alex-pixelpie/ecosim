import {Component} from "../../core/ECS.ts";
import {MathUtils, Pos} from "../../utils/Math.ts";
import {GameLogic, GameSystem} from "../GameLogic.ts";
import {GameLogicModule } from "../GameLogicModule.ts";
import {Position} from "./PhaserPhysicsModule.ts";

export class Attacker implements Component {
    get attacking(): boolean {
        return this.target !== null;
    }
    
    target: number | null = null;
    x: number = 0;
    y: number = 0;
    targetSize: number = 0;
    minAttackRange:number = 0; // Determined by weapon
    maxAttackRange:number = 0; // Determined by weapon
    
    constructor(public ownSize:number) {}

    distanceFromTarget(from: Pos): number {
        return MathUtils.distance(from, this) - this.ownSize;
    }

    attack(target: number, targetSize:number, x:number, y:number): void {
        this.target = target;
        this.targetSize = targetSize/2;
        this.x = x;
        this.y = y;
    }
    
    stopAttacking(){
        this.target = null;
    }
    
    tooClose(from: Pos): boolean {
        let distance = MathUtils.distance(from, this) - this.targetSize - this.ownSize;
        return distance < this.minAttackRange;
    }
    
    inRange(from: Pos): boolean {
        let distance = MathUtils.distance(from, this) - this.targetSize - this.ownSize;
        return distance >= this.minAttackRange && distance <= this.maxAttackRange;
    }
}

export class Targetable extends Component {}

export class Targeting extends Component {
    constructor(public targetGroups: Set<number>) {
        super();
    }
}

export class Targeted implements Component {
    targetedBy: number[] = [];
}

export class TargetGroup extends Component {
    public constructor(public id: number) {
        super();
    }
}

export class UpdateTargetsSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Attacker]);

    protected init(): void {
        this.componentsRequired = new Set([Attacker]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const attackTarget = this.game.ecs.getComponent<Attacker>(entity, Attacker);

            if (!attackTarget.target) {
                return;
            }
            
            // If we have a target, and it's no longer valid, clear it
            if (!this.game.mobs.has(attackTarget.target)) {
                attackTarget.stopAttacking();
                return;
            }
            
            // Update target position
            const position = this.game.ecs.getComponent(attackTarget.target, Position);
            if (!position) {
                return;
            }

            attackTarget.x = position.x;
            attackTarget.y = position.y;
        });
    }
}

class TargetedResetSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Targeted]);

    protected init(): void {
        this.componentsRequired = new Set([Targeted]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const targeted = this.game.ecs.getComponent(entity, Targeted);
            targeted.targetedBy = [];
        });
    }
}

export class TargetingModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const targetedResetSystem = new TargetedResetSystem(game);
        game.ecs.addSystem(targetedResetSystem);
        
        const targetSelectionSystem = new UpdateTargetsSystem(game);
        game.ecs.addSystem(targetSelectionSystem);
    }
}