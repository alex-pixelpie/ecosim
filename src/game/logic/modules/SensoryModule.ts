import {GameLogic, GameSystem} from "../GameLogic.ts";
import {GameLogicModule} from "../GameLogicModule.ts";
import {Component, ECS, Entity} from "../../core/ECS.ts";
import {Position, Size} from "./PhaserPhysicsModule.ts";
import {MathUtils, Pos} from "../../utils/Math.ts";
import {Targetable, TargetGroup, Targeting} from "./TargetingModule.ts";
import {Lootable} from "./LootModule.ts";
import {Configs} from "../../configs/Configs.ts";
import {GroupType} from "./MobsModule.ts";

export class GroupAwarenessRef extends Component {
    public constructor(public awareness: GroupAwareness) {
        super();
    }
}

export class GroupAwareness extends Component {
    public enemies: Set<number> = new Set();
    public allies: Set<number> = new Set();
    public loot: Set<number> = new Set();
    public positions = new Map<number, Pos>();
    
    public constructor(public group: GroupType) {
        super();
    }
    
    public static getAwareness = (ecs: ECS, entity: number): GroupAwareness => {
        const groupAwarenessRef = ecs.getComponent(entity, GroupAwarenessRef);
        if (groupAwarenessRef) {
            return groupAwarenessRef.awareness;
        }
        
        const group = ecs.getComponent(entity, TargetGroup);
        let groupAwareness = 
            ecs.getEntitiesWithComponent(GroupAwareness)
            .map(entity => ecs.getComponent(entity, GroupAwareness))
            .find(groupAwareness => groupAwareness.group === group.id);

        if (!groupAwareness) {
            groupAwareness = new GroupAwareness(group.id);
            const groupAwarenessEntity = ecs.addEntity();
            ecs.addComponent(groupAwarenessEntity, groupAwareness);
        }
        
        ecs.addComponent(entity, new GroupAwarenessRef(groupAwareness));
        
        return groupAwareness;
    }

    clearDead(ecs: ECS) {
        this.enemies.forEach(enemy => {
            if (!ecs.hasEntity(enemy)) {
                this.enemies.delete(enemy);
                this.positions.delete(enemy);
            }
        });
        
        this.allies.forEach(ally => {
            if (!ecs.hasEntity(ally)) {
                this.allies.delete(ally);
                this.positions.delete(ally);
            }
        });
        
        this.loot.forEach(loot => {
            if (!ecs.hasEntity(loot)) {
                this.loot.delete(loot);
                this.positions.delete(loot);
            }
        });
    }

    clearInvisible(ecs: ECS) {
        this.positions.forEach((_, entity) => {
            const observed = ecs.getComponent(entity, Observed);
            if (observed && !observed.visibleToGroup.get(this.group)) {
                this.positions.delete(entity);
                this.enemies.delete(entity);
                this.allies.delete(entity);
                this.loot.delete(entity);
            }
        });
    }
}

export class Observable extends Component {}

export class Observed extends Component {
    public visibleToGroup: Map<GroupType, boolean> = new Map();
    public lastSeen: Map<GroupType, number> = new Map();
    public alwaysOn: boolean = false;
    public forgetImmediately: boolean = false;
}

class ObservedSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Observed]);

    protected init(): void {
        this.componentsRequired = new Set([Observed]);
    }

    public update(entities: Set<number>, _: number): void {
        const game = this.game;
        const secondsToForgetObserved = Configs.mapConfig.secondsToForgetObserved;
        const currentTime = game.time;
        
        entities.forEach(entity => {
            const observed = game.ecs.getComponent(entity, Observed);
            if (!observed || observed.alwaysOn) {
                return;
            }
            
            observed.lastSeen.forEach((time, group) => {
                const visible = currentTime - time < (observed.forgetImmediately ? 0.1 : secondsToForgetObserved)
                observed.visibleToGroup.set(group, visible);
            });
        });
    }
}

export class Senses extends Component {
    public constructor(public range: number) {
        super();
    }
}

class SensorySystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Senses, Position, TargetGroup]);

    protected init(): void {
        this.componentsRequired = new Set([Senses, Position, TargetGroup]);
    }

    public update(entities: Set<number>, _: number): void {
        const game = this.game;
        
        const groups = game.ecs.getEntitiesWithComponent(GroupAwareness);
        const groupAwareness = new Map<number, GroupAwareness>();
        groups.forEach(group => {
            const groupAware = game.ecs.getComponent(group, GroupAwareness);
            groupAwareness.set(groupAware.group, groupAware);
            groupAware.clearDead(game.ecs);
            groupAware.clearInvisible(game.ecs);
        });
        
        entities.forEach(entity => {
            const group = game.ecs.getComponent(entity, TargetGroup);
            const awareness = groupAwareness.get(group?.id);
            
            if (!awareness){
                return;
            }

            const targeting = game.ecs.getComponent(entity, Targeting);
            const senses = game.ecs.getComponent(entity, Senses);
            const position = game.ecs.getComponent(entity, Position);
            const size = game.ecs.getComponent(entity, Size);
            
            const hs = -size.radius/2;
            const pos = {x: hs + position.x, y:hs + position.y};
            
            game.ecs.getEntitiesWithComponents([Observable]).forEach(otherEntity => {
                if (entity === otherEntity) {
                    return;
                }
                
                const otherPosition = game.ecs.getComponent(otherEntity, Position);
                if (!otherPosition) {
                    return;
                }
                
                const distance = MathUtils.distance(pos, otherPosition);
                
                if (distance < senses.range) {
                    if (group.id == GroupType.Green) SensorySystem.updateObserved(game, otherEntity, group.id);
                    
                    awareness.positions.set(otherEntity, {...otherPosition});

                    const targetable = game.ecs.getComponent(otherEntity, Targetable);
                    if (targetable) {
                        const targetGroup = game.ecs.getComponent(otherEntity, TargetGroup);
                        const bucket = targeting.targetGroups.has(targetGroup?.id) ? awareness.enemies : awareness.allies;
                        bucket.add(otherEntity);
                        return;
                    }
                    
                    const lootable = game.ecs.getComponent(otherEntity, Lootable);
                    if (lootable) {
                        awareness.loot.add(otherEntity);
                        return;
                    }
                }
            });
        });
    }

    private static updateObserved(game: GameLogic, entity: Entity, group:GroupType) {
        const obs = game.ecs.getComponent(entity, Observed);
        const observed = obs || new Observed();
        if (!obs) {
            game.ecs.addComponent(entity, observed);
        }

        observed.lastSeen.set(group, game.time);
    }
}

export class SensoryModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const sensorySystem = new SensorySystem(game);
        game.ecs.addSystem(sensorySystem);
        
        const observedSystem = new ObservedSystem(game);
        game.ecs.addSystem(observedSystem);
    }
    
}