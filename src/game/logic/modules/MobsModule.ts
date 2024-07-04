import {GameLogic, GameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {Weapon} from "./weapons/Weapons.ts";
import {Steering, WallsAvoider} from "./SteeringModule.ts";
import {FrameLog} from "./FrameLogModule.ts";
import {GlideLocomotion} from "./LocomotionModule.ts";
import {OverwhelmComponent} from "./OverwhelmModule.ts";
import {DieAndDrop, Health, Mortality} from "./DeathModule.ts";
import {Targeting, Targetable, Targeted, TargetGroup, TargetOfAttack} from "./TargetingModule.ts";
import {MobSpawnDefinition, MobType, WeaponConfig} from "../../configs/MobsConfig.ts";
import {Observable, Observed, Senses} from "./SensoryModule.ts";
import {Inventory, Looter} from "./LootModule.ts";
import {Patrol, PatrolBehavior} from "./utility-behavior/PatrolBehavior.ts";
import {IdleBehavior} from "./utility-behavior/IdleBehavior.ts";
import {IUtilityBehavior, UtilityBehavior} from "./utility-behavior/UtilityBehaviorModule.ts";

export enum GroupType {
    Red = 0,
    Green = 1
}

const groupTypeValues = Object.values(GroupType) as number[];

export class Mob extends Component {
    public constructor(public type: MobType) {
        super();
    }
}

const behaviorsMap = new Map<string, Function>([
    [PatrolBehavior.name, PatrolBehavior],
    [IdleBehavior.name, IdleBehavior]
]);

export class MobsFactory {
    static makeMob(game: GameLogic, {config,x, y, group, patrol, looting, behaviors}:MobSpawnDefinition) {
        const mob = game.ecs.addEntity();
        
        game.ecs.addComponent(mob, new Mob(config.type));
        
        // Common
        MobsFactory.addCommonComponents(game, mob, group);

        // Drops
        game.ecs.addComponent(mob, new DieAndDrop(config.drops));
        
        // Overwhelm
        game.ecs.addComponent(mob, new OverwhelmComponent(config.survivalSecondsToOverwhelm));
        
        // Targeting
        MobsFactory.addTargeting(game, mob, group, config.size, config.sensoryRange);
        
        // Movement
        MobsFactory.addMovement(game, mob, config.speed);
        
        // Combat
        MobsFactory.addCombat(game, mob, config.health, config.weaponConfig);
        
        // Physics
        MobsFactory.addPhysics(game, mob, x, y, config.size);

        if (patrol){
            game.ecs.addComponent(mob, new Patrol(patrol, config.size));
        }
        
        if (looting){
            game.ecs.addComponent(mob, new Looter(config.size));
            game.ecs.addComponent(mob, new Inventory());
        }
        
        if (behaviors){
            game.ecs.addComponent(mob, new UtilityBehavior(behaviors.map(behaviorName => new (behaviorsMap.get(behaviorName) as any)() as IUtilityBehavior), group));
        }
        
        game.mobs.add(mob);

        return mob;
    }

    static addTargeting(game: GameLogic, entity: number, ownGroup: number, size: number, sensoryRange: number){
        // Targeting all groups except own
        game.ecs.addComponent(entity, new Senses(sensoryRange));

        game.ecs.addComponent(entity, new TargetOfAttack(size/2));
        game.ecs.addComponent(entity, new Targeted());
        game.ecs.addComponent(entity, new Targetable());
        game.ecs.addComponent(entity, new Targeting(groupTypeValues.filter(group => group !== ownGroup).reduce((acc, group) => acc.add(group), new Set<number>()) as Set<number>));
    }

    static addMovement(game: GameLogic, entity: number, speed: number, avoidWalls = true){
        game.ecs.addComponent(entity, new GlideLocomotion(speed));
        game.ecs.addComponent(entity, new Steering());
        avoidWalls && game.ecs.addComponent(entity, new WallsAvoider());
    }

    static addCombat(game: GameLogic, entity: number, health:number, weaponConfig: WeaponConfig){
        game.ecs.addComponent(entity, new Health(health));
        game.ecs.addComponent(entity, new Weapon(weaponConfig));
        game.ecs.addComponent(entity, new Mortality());
    }
    
    static addPhysics(game: GameLogic, entity: number, x:number, y:number, size:number) {
        game.addPhysicalComponents({entity, x, y, radius: size, isStatic: false});
    }
    
    static addCommonComponents(game: GameLogic, entity: number, group:number){
        game.ecs.addComponent(entity, new FrameLog());
        game.ecs.addComponent(entity, new TargetGroup(group));
        game.ecs.addComponent(entity, new Observable());
        const observed = new Observed();
        game.ecs.addComponent(entity, observed);

        if (group == GroupType.Green){
            observed.alwaysOn = true;
        } else {
            observed.forgetImmediately = true;
        }
    }
}

export class LairMobsSpawner extends Component {
    static idIndex:number = 0;
    static get nextId():number {
        return LairMobsSpawner.idIndex++;
    }
    
    timeOfLastSpawn:number = 0;
    spawns:Set<number> = new Set();
    id: number;
    
    constructor(public maxSpawns: number, public spawnCooldown:number, public spawnDefinition:MobSpawnDefinition) {
        super();
        this.id = LairMobsSpawner.nextId;
    }
    
    public canSpawn(now:number): boolean {
        return this.spawns.size < this.maxSpawns && this.timeOfLastSpawn + this.spawnCooldown < now;
    }
    
    public spawn(now:number, mob:number): void {
        this.timeOfLastSpawn = now;
        this.spawns.add(mob);
    }
    
    public despawn(mob: number, now: number): void {
        this.timeOfLastSpawn = now;
        this.spawns.delete(mob);
    }
}

export class LairMob extends Component {
    constructor(public lair: number) {
        super();
    }
}

class LairMobsSpawnerSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([LairMobsSpawner]);
    
    protected init(): void {
        this.componentsRequired = new Set([LairMobsSpawner]);
    }
    
    public update(entities: Set<number>, _: number): void {
        const now = this.game.time;
        
        entities.forEach(entity => {
            const spawner = this.game.ecs.getComponent<LairMobsSpawner>(entity, LairMobsSpawner);
            if (spawner.canSpawn(now)){
                const mob = MobsFactory.makeMob(this.game, spawner.spawnDefinition);
                spawner.spawn(now, mob);
                this.game.ecs.addComponent(mob, new LairMob(spawner.id));
            }
            
            spawner.spawns.forEach(mob => {
                if (!this.game.mobs.has(mob)){
                    spawner.despawn(mob, now);
                }
            });
        });
    }
}
    
export class MobsModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const lairMobsSpawnerSystem = new LairMobsSpawnerSystem(game);
        game.ecs.addSystem(lairMobsSpawnerSystem);
    }
}