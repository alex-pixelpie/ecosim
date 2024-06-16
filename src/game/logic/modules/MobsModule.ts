import {GameLogic, TimedGameSystem} from "../GameLogic.ts";
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
import {MobsTargeting, RangeFromTarget, Targetable, Targeted, TargetGroup, TargetSelection} from "./TargetingModule.ts";
import {MobConfig, MobSpawnDefinition, MobType, WeaponConfig} from "../../configs/MobsConfig.ts";
import {Configs} from "../../configs/Configs.ts";
import {PatrolGoal} from "./goap/goals/PatrolGoal.ts";
import {StartPatrolAction} from "./goap/actions/StartPatrolAction.ts";
import {MoveAction} from "./goap/actions/MoveAction.ts";
import {Patrol} from "./goap-connector/GoapConnectorModule.ts";

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

export class MobsSpawn extends Component {
    public constructor(public mobs: MobSpawnDefinition[], public group: number, public position: {x: number, y: number}) {
        super();
    }
}

class MobSpawnUpgradeSystem extends TimedGameSystem {
    protected updateTimed(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const mobsSpawn = this.game.ecs.getComponent(entity, MobsSpawn);
            mobsSpawn.mobs.forEach(mob => {
                mob.count += 1;
            });
        });
    }
    
    protected init(): void {
        this.componentsRequired = new Set([MobsSpawn]);
    }
    
    public componentsRequired: Set<Function> = new Set([MobsSpawn]);
}

const ActionTypeToAction = new Map<string, Action>(
    [
        [StartPatrolAction.name, new StartPatrolAction()],
        [MoveAction.name, new MoveAction()]
    ]
);

const GoalTypeToGoal = new Map<string, Goal>(
    [
        [PatrolGoal.name, new PatrolGoal()],
    ]
);

export class MobSpawnSystem extends TimedGameSystem {
    protected updateTimed(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const mobsSpawn = this.game.ecs.getComponent(entity, MobsSpawn);
            mobsSpawn.mobs.forEach(mob => {
                for (let i = 0; i < mob.count; i++) {
                    MobSpawnSystem.makeMob(this.game, mob.config, mobsSpawn.position.x, mobsSpawn.position.y, mobsSpawn.group);
                }
            });
        });
    }
    
    static makeMob(game: GameLogic, config: MobConfig, x: number, y: number, group: number){
        const mob = game.ecs.addEntity();
        game.ecs.addComponent(mob, new Mob(config.type));
        
        // Common
        MobSpawnSystem.addCommonComponents(game, mob, group);
        
        // GOAP
        MobSpawnSystem.addGoap(game, mob, config.actions.map(action => ActionTypeToAction.get(action) as Action), config.goals.map(goal => GoalTypeToGoal.get(goal) as Goal));
        
        // Drops
        game.ecs.addComponent(mob, new DieAndDrop(config.drops));
        
        // Overwhelm
        game.ecs.addComponent(mob, new OverwhelmComponent(config.survivalSecondsToOverwhelm));
        
        // Targeting
        MobSpawnSystem.addTargeting(game, mob, group, config.size);
        
        // Movement
        MobSpawnSystem.addMovement(game, mob, config.speed);
        
        // Combat
        MobSpawnSystem.addCombat(game, mob, config.health, config.weaponConfig);
        
        // Physics
        MobSpawnSystem.addPhysics(game, mob, x, y, config.size);    
        
        return mob;
    }
    
    protected init(): void {
        this.componentsRequired = new Set([MobsSpawn]);
    }
    
    public componentsRequired: Set<Function> = new Set([MobsSpawn]);

    static addGoap(game: GameLogic, entity: number, actions: Action[], goals: Goal[]){
        game.ecs.addComponent(entity, new GoapStateComponent({...defaultGoapState}));
        game.ecs.addComponent(entity, new GoalsComponent(goals));
        game.ecs.addComponent(entity, new AvailableActionsComponent(actions));
        game.ecs.addComponent(entity, new ActionComponent());
    }

    static addTargeting(game: GameLogic, entity: number, ownGroup: number, size:number){
        // Targeting all groups except own
        game.ecs.addComponent(entity, new TargetSelection());
        game.ecs.addComponent(entity, new Targeted());
        game.ecs.addComponent(entity, new Targetable());
        game.ecs.addComponent(entity, new MobsTargeting(groupTypeValues.filter(group => group !== ownGroup).reduce((acc, group) => acc.add(group), new Set<number>()) as Set<number>));
        game.ecs.addComponent(entity, new RangeFromTarget(size));
    }

    static addMovement(game: GameLogic, entity: number, speed: number, avoidWalls = true){
        game.ecs.addComponent(entity, new GlideLocomotion(speed));
        game.ecs.addComponent(entity, new Steering());
        game.ecs.addComponent(entity, new LocomotionTarget(0, 0, 16))
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

const mobSpawnInterval = 5;
const mobsSpawnUpgradeInterval = 10;

export class MobsModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const spawnSystem = new MobSpawnSystem(game, mobSpawnInterval);
        game.ecs.addSystem(spawnSystem);
        
        const spawnUpgradeSystem = new MobSpawnUpgradeSystem(game, mobsSpawnUpgradeInterval);
        game.ecs.addSystem(spawnUpgradeSystem);
        
        // Initial spawn
        const pos = Configs.mapConfig.pixelsSize/2;
        const mob = MobSpawnSystem.makeMob(game, Configs.mobsConfig.getMobConfig(MobType.Skeleton), pos, pos, GroupType.Red);
        game.ecs.addComponent(mob, new Patrol({maxFrequency: 10, minFrequency: 5, range:500, targetRadius: 200, targetPosition: {x: pos, y: pos}}, 16));
    }
}