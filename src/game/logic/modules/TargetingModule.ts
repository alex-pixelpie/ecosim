import {Component} from "../../core/ECS.ts";
import {MathUtils, Pos} from "../../utils/Math.ts";
import {GameLogic, GameLogicModule, GameSystem, TimedGameSystem} from "../GameLogic.ts";
import {PhysicsBody, Position} from "./PhaserPhysicsModule.ts";
import {Dead} from "./DeathModule.ts";

export class TargetSelection implements Component {
    target: number | null = null;
    x: number = 0;
    y: number = 0;
    targetSize: number = 0;
    
    constructor() {}
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

export class RangeFromTarget extends Component {
    constructor(public maxDistance: number = 1, public minDistance: number = 0, public ownSize: number = 0) {
        super();
    }

    distanceFromTarget(currentPosition: Pos, targetPosition: Pos): number {
        return MathUtils.distance(currentPosition, targetPosition) - this.ownSize;
    }
    
    inRange(currentPosition: Pos, targetPosition: Pos, otherSize:number): boolean {
        let distance = MathUtils.distance(currentPosition, targetPosition) - otherSize - this.ownSize;
        return distance <= this.maxDistance && distance >= this.minDistance;
    }
    
    tooClose(currentPosition: Pos, targetPosition: Pos, otherSize:number): boolean {
        const distance = MathUtils.distance(currentPosition, targetPosition) - otherSize - this.ownSize;
        return distance < this.minDistance;
    }
    
    tooFar(currentPosition: Pos, targetPosition: Pos, otherSize:number): boolean {
        const distance = MathUtils.distance(currentPosition, targetPosition) - otherSize - this.ownSize;
        return distance > this.maxDistance;
    }
}

export class MobTargetSelectionSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([TargetSelection, MobsTargeting]);

    protected init(): void {
        this.componentsRequired = new Set([TargetSelection, MobsTargeting]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const targetSelection = this.game.ecs.getComponent<TargetSelection>(entity, TargetSelection);

            // If we have a target, and it's no longer valid, clear it
            if (targetSelection.target && !this.game.mobs.has(targetSelection.target)) {
                targetSelection.target = null;
            }

            // If we don't have a target, select one
            if (!targetSelection.target) {
                targetSelection.target = MobTargetSelectionSystem.selectTarget(this.game, entity);
            }
            
            const target = targetSelection.target;
            if (!target) {
                return;
            }
            
            // Track the target's position
            const targetPosition = this.game.ecs.getComponent(target, Position);

            if (targetPosition) {
                targetSelection.x = targetPosition.x;
                targetSelection.y = targetPosition.y;
                return;
            }
        });
    }

    static selectTarget(game:GameLogic, entity: number): number | null {
        const position = game.ecs.getComponent(entity, Position);
        const targetSelection = game.ecs.getComponent(entity, TargetSelection);
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

class MobTargetReselectionSystem extends TimedGameSystem {
    public componentsRequired: Set<Function> = new Set([TargetSelection, MobsTargeting]);

    protected init(): void {
        this.componentsRequired = new Set([TargetSelection, MobsTargeting]);
    }

    public updateTimed(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const targetSelection = this.game.ecs.getComponent(entity, TargetSelection);
            targetSelection.target = MobTargetSelectionSystem.selectTarget(this.game, entity);
        });
    }
}

const reselectionInterval = 3;

export class TargetingModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const targetedResetSystem = new TargetedResetSystem(game);
        game.ecs.addSystem(targetedResetSystem);
        
        const targetSelectionSystem = new MobTargetSelectionSystem(game);
        game.ecs.addSystem(targetSelectionSystem);
        
        const targetReselectionSystem = new MobTargetReselectionSystem(game, reselectionInterval);
        game.ecs.addSystem(targetReselectionSystem);
    }
}