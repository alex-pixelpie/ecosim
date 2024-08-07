import {GameLogic, GameSystem} from "../GameLogic.ts";
import {GameLogicModule} from "../GameLogicModule.ts";
import {Component, ECS, Entity} from "../../core/ECS.ts";
import {Position, Size} from "./PhaserPhysicsModule.ts";
import {MathUtils, Pos} from "../../utils/Math.ts";
import {Targetable, TargetGroup, Targeting} from "./TargetingModule.ts";
import {Inventory, Loot, Lootable, LootType} from "./LootModule.ts";
import {Configs} from "../../configs/Configs.ts";
import {GroupType} from "./MobsModule.ts";
import {Conquerable, LootReturnTarget} from "./BuildingsModule.ts";

class GroupLootRef extends Component {
    public constructor(public groupLoot: GroupLoot) {
        super();
    }
}

export class GroupLoot extends Component {
    coins: number = 0;
    lastDropPosition: Pos = {x: 0, y: 0};
    
    public constructor(public group: GroupType) {
        super();
    }

    public dropCoinsAt(game: GameLogic, position:Pos, value: number = 1): void {
        if (this.coins <= value) {
            return;
        }

        if (MathUtils.distance(this.lastDropPosition, position) < 10) {
            return;
        }

        this.lastDropPosition = {...position};
        
        this.coins -= value;
        const coinEntity = game.ecs.addEntity();
        game.ecs.addComponent(coinEntity, new Loot(LootType.Coin, 10, value));
        game.ecs.addComponent(coinEntity, new Position(position.x, position.y));
        game.ecs.addComponent(coinEntity, new Lootable());
        game.ecs.addComponent(coinEntity, new Observable());
        
        const observed = new Observed();
        observed.alwaysOn = true;
        game.ecs.addComponent(coinEntity, observed);

        SensorySystem.updateAwareness(game, GroupAwareness.getGroupAwarenessByGroup(game.ecs, GroupType.Green), GroupType.Green, position, coinEntity);
    }
    
    public returnLoot(from:Inventory) {
        this.coins += from.coins;
        from.coins = 0;
    }
    
    public static getGroupLoot = (ecs: ECS, entity: number): GroupLoot => {
        const groupLootRef = ecs.getComponent(entity, GroupLootRef);
        if (groupLootRef) {
            return groupLootRef.groupLoot;
        }
        
        const group = ecs.getComponent(entity, TargetGroup);
        let groupLoot = 
            ecs.getEntitiesWithComponent(GroupLoot)
            .map(entity => ecs.getComponent(entity, GroupLoot))
            .find(groupLoot => groupLoot.group === group.id);

        if (!groupLoot) {
            groupLoot = new GroupLoot(group.id);
            const groupLootEntity = ecs.addEntity();
            ecs.addComponent(groupLootEntity, groupLoot);
        }
        
        ecs.addComponent(entity, new GroupLootRef(groupLoot));
        
        return groupLoot;
    }
    
    public static getGroupLootByGroup = (ecs: ECS, group: GroupType): GroupLoot => {
        let groupLoot = 
            ecs.getEntitiesWithComponent(GroupLoot)
            .map(entity => ecs.getComponent(entity, GroupLoot))
            .find(groupLoot => groupLoot.group === group);
        
        if (!groupLoot) {
            groupLoot = new GroupLoot(group);
            const groupLootEntity = ecs.addEntity();
            ecs.addComponent(groupLootEntity, groupLoot);        
        }
        
        return groupLoot;
    }
}

class GroupAwarenessRef extends Component {
    public constructor(public awareness: GroupAwareness) {
        super();
    }
}

export class GroupAwareness extends Component {
    public enemies: Set<number> = new Set();
    public allies: Set<number> = new Set();
    public loot: Set<number> = new Set();
    public conquests: Map<number, number> = new Map();
    public lootDibs: Map<number, number> = new Map();
    public lootReturnTargets: Set<number> = new Set();
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

    public static getGroupAwarenessByGroup = (ecs: ECS, group: GroupType): GroupAwareness => {
        let groupAwareness =
            ecs.getEntitiesWithComponent(GroupAwareness)
                .map(entity => ecs.getComponent(entity, GroupAwareness))
                .find(groupAwareness => groupAwareness.group === group);

        if (!groupAwareness) {
            groupAwareness = new GroupAwareness(group);
            const groupLootEntity = ecs.addEntity();
            ecs.addComponent(groupLootEntity, groupAwareness);
        }

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
        
        this.conquests.forEach((_, entity) => {
            if (!ecs.hasEntity(entity)) {
                this.conquests.delete(entity);
            }
        });
        
        this.lootDibs.forEach((_, entity) => {
            if (!ecs.hasEntity(entity)) {
                this.lootDibs.delete(entity);
            }
        });
        
        this.lootReturnTargets.forEach((_, entity) => {
            if (!ecs.hasEntity(entity)) {
                this.lootReturnTargets.delete(entity);
            }
        });
    }

    clearInvisible(ecs: ECS) {
        this.positions.forEach((_, entity) => {
            const observed = ecs.getComponent(entity, Observed);
            if (!observed || !observed?.visibleToGroup.get(this.group)) {
                this.positions.delete(entity);
                this.enemies.delete(entity);
                this.allies.delete(entity);
                this.loot.delete(entity);
                this.conquests.delete(entity);
                this.lootDibs.delete(entity);
                this.lootReturnTargets.delete(entity);
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
            if (!observed) {
                return;
            }
            
            observed.lastSeen.forEach((time, group) => {
                const visible = observed.alwaysOn || currentTime - time < (observed.forgetImmediately ? 0.1 : secondsToForgetObserved)
                observed.visibleToGroup.set(group, visible);
                
                if (!observed.alwaysOn) {
                    return;
                }
                
                const position = game.ecs.getComponent(entity, Position);
                if (!position) {
                    return;
                }
                
                SensorySystem.updateAwareness(game, GroupAwareness.getGroupAwarenessByGroup(game.ecs, group), GroupType.Green, position, entity);
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
        
        // Clear dead and invisible entities from awareness
        Object.keys(GroupType).forEach(groupKey => {
            const group = GroupType[groupKey as keyof typeof GroupType];
            const awareness = GroupAwareness.getGroupAwarenessByGroup(game.ecs, group);
            awareness.clearDead(game.ecs);
            awareness.clearInvisible(game.ecs);
        });
        
        entities.forEach(entity => {
            const group = game.ecs.getComponent(entity, TargetGroup);
            const awareness = GroupAwareness.getAwareness(game.ecs, entity);
            
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
                const otherPosition = game.ecs.getComponent(otherEntity, Position);
                if (!otherPosition) {
                    return;
                }
                
                const distance = MathUtils.distance(pos, otherPosition);
                
                if (distance < senses.range) {
                    SensorySystem.updateAwareness(game, awareness, group.id, otherPosition, otherEntity, targeting);
                }
            });
        });
    }

    public static updateAwareness(game: GameLogic, awareness:GroupAwareness, group:GroupType, position:Pos, otherEntity: Entity, targeting:Targeting | undefined = undefined) {
        if (group == GroupType.Green) SensorySystem.updateObserved(game, otherEntity, group);

        awareness.positions.set(otherEntity, {...position});

        if (targeting){
            const targetable = game.ecs.getComponent(otherEntity, Targetable);
            if (targetable) {
                const targetGroup = game.ecs.getComponent(otherEntity, TargetGroup);
                if (!targetGroup) {
                    return;
                }
                const bucket = targeting.targetGroups.has(targetGroup?.id) ? awareness.enemies : awareness.allies;
                bucket.add(otherEntity);
                return;
            }
        }

        const lootable = game.ecs.getComponent(otherEntity, Lootable);
        if (lootable) {
            awareness.loot.add(otherEntity);
            return;
        }

        const conquerable = game.ecs.getComponent(otherEntity, Conquerable);
        if (conquerable && conquerable.group != group) {
            awareness.conquests.set(otherEntity, conquerable.conquestPoints);
            return;
        }

        const lootReturnTarget = game.ecs.getComponent(otherEntity, LootReturnTarget);
        if (lootReturnTarget && lootReturnTarget.group == group) {
            awareness.lootReturnTargets.add(otherEntity);
            return;
        }
    }
    
    public static updateObserved(game: GameLogic, entity: Entity, group:GroupType) {
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