import {GameLogic, GameSystem, TimedGameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {GoapState, GoapStateComponent} from "./goap/GoapStateComponent.ts";
import {Weapon} from "./weapons/Weapons.ts";
import {Steering} from "./SteeringModule.ts";
import {FrameLog} from "./FrameLogModule.ts";
import {GlideLocomotion} from "./LocomotionModule.ts";
import {GetTargetAction} from "./goap/actions/GetTargetAction.ts";
import {MoveAction} from "./goap/actions/MoveAction.ts";
import {AttackAction} from "./goap/actions/AttackAction.ts";
import {KillEnemiesGoal} from "./goap/goals/KillEnemiesGoal.ts";
import {Action} from "./goap/actions/Action.ts";
import {EscapeOverwhelmAction} from "./goap/actions/EscapeOverwhelmAction.ts";
import {EscapeOverwhelmGoal} from "./goap/goals/EscapeOverwhelmGoal.ts";
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
import { defaultState } from "./goap/GoapStateComponent.ts";

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

export class MobsCounter extends Component {
    public constructor(public count: number) {
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
        [GetTargetAction.name, new GetTargetAction()],
        [MoveAction.name, new MoveAction()],
        [AttackAction.name, new AttackAction()],
        [EscapeOverwhelmAction.name, new EscapeOverwhelmAction()]
    ]
);

const GoalTypeToGoal = new Map<string, Goal>(
    [
        [KillEnemiesGoal.name, new KillEnemiesGoal()],
        [EscapeOverwhelmGoal.name, new EscapeOverwhelmGoal()]
    ]
);

export class MobSpawnSystem extends TimedGameSystem {
    protected updateTimed(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const mobsSpawn = this.game.ecs.getComponent(entity, MobsSpawn);
            mobsSpawn.mobs.forEach(mob => {
                for (let i = 0; i < mob.count; i++) {
                    this.makeMob(this.game, mob.config, mobsSpawn.position.x, mobsSpawn.position.y, mobsSpawn.group);
                }
            });
        });
    }
    
    makeMob(game: GameLogic, config: MobConfig, x: number, y: number, group: number){
        const entity = game.ecs.addEntity();
        game.ecs.addComponent(entity, new Mob(config.type));
        
        // Common
        MobSpawnSystem.addCommonComponents(game, entity, group);
        
        // GOAP
        MobSpawnSystem.addGoap(game, entity, config.actions.map(action => ActionTypeToAction.get(action) as Action), config.goals.map(goal => GoalTypeToGoal.get(goal) as Goal));
        
        // Drops
        game.ecs.addComponent(entity, new DieAndDrop(config.drops));
        
        // Overwhelm
        game.ecs.addComponent(entity, new OverwhelmComponent(config.survivalSecondsToOverwhelm));
        
        // Targeting
        MobSpawnSystem.addTargeting(game, entity, group, config.size);
        
        // Movement
        MobSpawnSystem.addMovement(game, entity, config.speed);
        
        // Combat
        MobSpawnSystem.addCombat(game, entity, config.health, config.weaponConfig);
        
        // Physics
        MobSpawnSystem.addPhysics(game, entity, x, y, config.size);    
    }
    
    protected init(): void {
        this.componentsRequired = new Set([MobsSpawn]);
    }
    
    public componentsRequired: Set<Function> = new Set([MobsSpawn]);

    static addGoap(game: GameLogic, entity: number, actions: Action[], goals: Goal[]){
        game.ecs.addComponent(entity, new GoapStateComponent({...defaultState} as Record<GoapState, boolean>));
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

    static addMovement(game: GameLogic, entity: number, speed: number){
        game.ecs.addComponent(entity, new GlideLocomotion(speed));
        game.ecs.addComponent(entity, new Steering());
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

class MobsCountSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([MobsCounter]);
    update(entities: Set<number>, _: number): void {
        const mobsCounter = this.game.ecs.getComponent(Array.from(entities)[0], MobsCounter);
        mobsCounter.count = this.game.mobs.size;
    }
    init(): void {
        this.componentsRequired = new Set([MobsCounter]);
    }
}

const updateInterval = 5;
const mobsSpawnUpgradeInterval = 10;

export class MobsModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const mobsEntity = game.ecs.addEntity();
        
        // TODO - move MobsCounter and MobsCountSystem behavior somewhere else
        game.ecs.addComponent(mobsEntity, new MobsCounter(0));
        const countSystem = new MobsCountSystem(game);
        game.ecs.addSystem(countSystem);
        
        const spawnSystem = new MobSpawnSystem(game, updateInterval);
        game.ecs.addSystem(spawnSystem);
        
        const spawnUpgradeSystem = new MobSpawnUpgradeSystem(game, mobsSpawnUpgradeInterval);
        game.ecs.addSystem(spawnUpgradeSystem);
    }
}