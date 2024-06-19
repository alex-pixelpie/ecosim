import {GameLogic} from "../GameLogic.ts";
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
import {MobConfig, MobSpawnDefinition, MobType, WeaponConfig} from "../../configs/MobsConfig.ts";
import {Configs} from "../../configs/Configs.ts";
import {PatrolGoal} from "./goap/goals/PatrolGoal.ts";
import {StartPatrolAction} from "./goap/actions/StartPatrolAction.ts";
import {MoveAction} from "./goap/actions/MoveAction.ts";
import {Patrol} from "./goap-connector/GoapConnectorModule.ts";
import {Senses} from "./SensoryModule.ts";
import {KillEnemiesGoal} from "./goap/goals/KillEnemiesGoal.ts";
import {StartAttackingEnemiesAction} from "./goap/actions/StartAttackingEnemiesAction.ts";
import {AttackAction} from "./goap/actions/AttackAction.ts";

enum GroupType {
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
    static makeMob(game: GameLogic, {config,x, y, group, goals, actions}:MobSpawnDefinition) {
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
        game.mobs.add(entity);
    }
    
    static addCommonComponents(game: GameLogic, entity: number, group:number){
        game.ecs.addComponent(entity, new FrameLog());
        game.ecs.addComponent(entity, new TargetGroup(group));
    }
}

export class LairMobsSpawner extends Component {
    spawns:number = 0;
    
    constructor(public maxSpawns: number, public spawnInterval: number, public mobConfig: MobConfig, public group: number, public position: {x: number, y: number}) {
        super();
    }
    
    public canSpawn(): boolean {
        return this.spawns < this.maxSpawns;
    }
    
    public spawn(): MobConfig {
        this.spawns++;
    }
}

export class MobsModule extends GameLogicModule {
    public init(game: GameLogic): void {
        // Initial spawn
        const pos = Configs.mapConfig.pixelsSize/2;
        const redSkeletonConfig = {
            config:Configs.mobsConfig.getMobConfig(MobType.Skeleton),
            x:pos,
            y:pos,
            group:GroupType.Red,
            goals:[PatrolGoal.name],
            actions:[StartPatrolAction.name,MoveAction.name]
        };
        
        const redSkeleton = MobsFactory.makeMob(game, redSkeletonConfig);
        game.ecs.addComponent(redSkeleton, new Patrol({maxFrequency: 10, minFrequency: 5, range:500, targetRadius: 200, targetPosition: {x: pos, y: pos}}, 16));

        
        const greenSkeletonConfig = {...redSkeletonConfig, group:GroupType.Green, x:pos-450, y:pos, goals:[KillEnemiesGoal.name], actions:[StartAttackingEnemiesAction.name, MoveAction.name, AttackAction.name]};
        const greenSkeleton = MobsFactory.makeMob(game, greenSkeletonConfig);
    }
}