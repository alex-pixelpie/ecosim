import {Component} from "../../core/ECS.ts";
import {MathUtils, Pos} from "../../utils/Math.ts";
import {GameLogic, GameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {PhysicsBody, Position, Size} from "./PhaserPhysicsModule.ts";
import {Dead} from "./DeathModule.ts";

export class AttackTarget implements Component {
    attacking:false;
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

    inRange(from: Pos): boolean {
        let distance = MathUtils.distance(from, this) - this.targetSize - this.ownSize;
        return distance <= this.minAttackRange && distance >= this.maxAttackRange;
    }
}

export class Targetable extends Component {}

export class MobsTargeting extends Component {
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

export class MobTargetSelectionSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([AttackTarget, MobsTargeting]);

    protected init(): void {
        this.componentsRequired = new Set([AttackTarget, MobsTargeting]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const attackTarget = this.game.ecs.getComponent<AttackTarget>(entity, AttackTarget);

            // If we have a target, and it's no longer valid, clear it
            if (attackTarget.target && !this.game.mobs.has(attackTarget.target)) {
                attackTarget.target = null;
            }

            // If we don't have a target, select one
            if (!attackTarget.target) {
                attackTarget.target = MobTargetSelectionSystem.selectTarget(this.game, entity);
            }
            
            const target = attackTarget.target;
            if (!target) {
                return;
            }
            
            // Track the target's position
            const targetPosition = this.game.ecs.getComponent(target, Position);
            
            if (targetPosition) {
                attackTarget.x = targetPosition.x;
                attackTarget.y = targetPosition.y;
            }
            
            const ownSize = this.game.ecs.getComponent(entity, Size);
            if (ownSize) {
                attackTarget.ownSize = ownSize.radius;
            }

            const otherSize = this.game.ecs.getComponent(target, Size);
            if (otherSize) {
                attackTarget.targetSize = otherSize.radius;
            }
        });
    }

    static selectTarget(game:GameLogic, entity: number): number | null {
        const position = game.ecs.getComponent(entity, Position);
        const targetSelection = game.ecs.getComponent(entity, AttackTarget);
        const mobTargeting = game.ecs.getComponent(entity, MobsTargeting);
        
        if (!position || !targetSelection || !mobTargeting) {
            return null;
        }

        const entities = game.ecs.getEntitiesWithComponents([Targetable, Position, TargetGroup]);

        const potentialTargets = [...entities].filter(e => {
            if (e === entity || e == null) {
                return false;
            }

            const dead = game.ecs.getComponent(e, Dead);
            if (dead) {
                return false;
            }
            
            const targetGroup = game.ecs.getComponent(e, TargetGroup);
            return mobTargeting.targetGroups.has(targetGroup.id);
        });
        
        if (potentialTargets.length === 0) {
            return null;
        }

        const targetsByDistance = potentialTargets.map(e => {
            const targetPosition = game.ecs.getComponent(e, Position);
            if (!targetPosition) {
                return null;
            }

            return {
                entity: e,
                distance: MathUtils.distance(position, targetPosition)
            };
        }).filter(v => v).sort((a, b) => (a?.distance ?? 0) - (b?.distance ?? 0));

        if (targetsByDistance.length === 0) {
            return null;
        }

        const target = targetsByDistance[0]!.entity;
        
        if (!target) {
            return null;
        }
        
        // Track that we are targeting this entity
        const targeted = game.ecs.getComponent<Targeted>(target, Targeted);
        if (targeted) {
            targeted.targetedBy.push(entity);
        }

        // Set the target size
        const body = game.ecs.getComponent(target, PhysicsBody);
        if (body) {
            targetSelection.targetSize = body.body.width/2;
        }
        
        return target;
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
        
        const targetSelectionSystem = new MobTargetSelectionSystem(game);
        game.ecs.addSystem(targetSelectionSystem);
    }
}