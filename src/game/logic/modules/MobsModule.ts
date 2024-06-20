import {GameLogic, GameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {defaultGoapState, GoapStateComponent} from "./goap/GoapStateComponent.ts";
import {Weapon} from "./weapons/Weapons.ts";
import {Steering, WallsAvoider} from "./SteeringModule.ts";
import {FrameLog} from "./FrameLogModule.ts";
import {GlideLocomotion, LocomotionTarget} from "./LocomotionModule.ts";
import {Action} from "./goap/actions/Action.ts";
import {OverwhelmComponent} from "./OverwhelmModule.ts";
import {DieAndDrop, Health, Mortality} from "./DeathModule.ts";
import {
    AvailableActionsComponent,
    Goal,
    GoalsComponent,
    ActionComponent
} from "./goap/GoapModule.ts";
import {Targeting, Targetable, Targeted, TargetGroup, TargetOfAttack} from "./TargetingModule.ts";
import {MobSpawnDefinition, MobType, WeaponConfig} from "../../configs/MobsConfig.ts";
import {Configs} from "../../configs/Configs.ts";
import {PatrolGoal} from "./goap/goals/PatrolGoal.ts";
import {StartPatrolAction} from "./goap/actions/StartPatrolAction.ts";
import {MoveAction} from "./goap/actions/MoveAction.ts";
import {Patrol} from "./goap-connector/GoapConnectorModule.ts";
import {Senses} from "./SensoryModule.ts";
import {KillEnemiesGoal} from "./goap/goals/KillEnemiesGoal.ts";
import {StartAttackingEnemiesAction} from "./goap/actions/StartAttackingEnemiesAction.ts";
import {AttackAction} from "./goap/actions/AttackAction.ts";

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

const ActionTypeToAction = new Map<string, Action>(
    [
        [StartPatrolAction.name, new StartPatrolAction()],
        [MoveAction.name, new MoveAction()],
        [StartAttackingEnemiesAction.name, new StartAttackingEnemiesAction()],
        [AttackAction.name, new AttackAction()]
    ]
);

const GoalTypeToGoal = new Map<string, Goal>(
    [
        [PatrolGoal.name, new PatrolGoal()],
        [KillEnemiesGoal.name, new KillEnemiesGoal()]
    ]
);

export class MobsFactory {
    static makeMob(game: GameLogic, {config,x, y, group, goals, actions, patrol}:MobSpawnDefinition) {
        const mob = game.ecs.addEntity();
        
        game.ecs.addComponent(mob, new Mob(config.type));
        
        // Common
        MobsFactory.addCommonComponents(game, mob, group);
        
        // GOAP
        MobsFactory.addGoap(game, mob, (actions || config.actions).map(action => ActionTypeToAction.get(action) as Action), (goals || config.goals).map(goal => GoalTypeToGoal.get(goal) as Goal));
        
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
        game.mobs.add(mob);

        return mob;
    }
    
    static addGoap(game: GameLogic, entity: number, actions: Action[], goals: Goal[]){
        game.ecs.addComponent(entity, new GoapStateComponent({...defaultGoapState}));
        game.ecs.addComponent(entity, new GoalsComponent(goals));
        game.ecs.addComponent(entity, new AvailableActionsComponent(actions));
        game.ecs.addComponent(entity, new ActionComponent());
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
        game.ecs.addComponent(entity, new LocomotionTarget(0, 0, 16, 0))
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
        const now = this.game.currentTime;
        
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
        
        
        // Initial spawn
        const pos = Configs.mapConfig.pixelsSize/2;
        const redSkeletonConfig:MobSpawnDefinition = {
            config:Configs.mobsConfig.getMobConfig(MobType.Skeleton),
            x:pos,
            y:pos,
            group:GroupType.Red,
            goals:[PatrolGoal.name],
            actions:[StartPatrolAction.name,MoveAction.name],
            patrol: {maxFrequency: 10, minFrequency: 5, range:500, targetRadius: 200, targetPosition: {x: pos, y: pos}}
        };
        const redSkeleton = MobsFactory.makeMob(game, redSkeletonConfig);

        
        const greenSkeletonConfig:MobSpawnDefinition = {
            config:Configs.mobsConfig.getMobConfig(MobType.Skeleton), 
            x:pos-450, 
            y:pos,
            group:GroupType.Green,
            goals:[KillEnemiesGoal.name], 
            actions:[StartAttackingEnemiesAction.name, MoveAction.name, AttackAction.name]
        };
        const greenSkeleton = MobsFactory.makeMob(game, greenSkeletonConfig);
    }
}