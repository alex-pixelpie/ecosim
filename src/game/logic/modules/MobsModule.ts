import {GameLogic, GameLogicModule, TimedGameSystem} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";
import {GoapState, MobGoapStateComponent} from "./goap/MobGoapStateComponent.ts";
import {GOAP} from "./goap/GoapModule.ts";
import {Health} from "./weapons/Attack.ts";
import {Weapon, WeaponConfig, WeaponEffect} from "./weapons/Weapons.ts";
import {Steering} from "./SteeringModule.ts";
import {FrameLog} from "./FrameLog.ts";
import {Group, RangeFromTarget, Targeted, TargetSelection} from "./Targeting.ts";
import {GlideLocomotion} from "./Locomotion.ts";
import {GetTargetAction} from "./goap/actions/GetTargetAction.ts";
import {MoveAction} from "./goap/actions/MoveAction.ts";
import {AttackAction} from "./goap/actions/AttackAction.ts";
import GoalsComponent = GOAP.GoalsComponent;
import AvailableActionsComponent = GOAP.AvailableActionsComponent;
import ActionComponent = GOAP.ActionComponent;
import {KillEnemiesGoal} from "./goap/goals/KillEnemiesGoal.ts";
import {Action} from "./goap/actions/Action.ts";
import {EscapeOverwhelmAction} from "./goap/actions/EscapeOverwhelmAction.ts";
import {EscapeOverwhelmGoal} from "./goap/goals/EscapeOverwhelmGoal.ts";
import {OverwhelmComponent} from "./OverwhelmModule.ts";
import Goal = GOAP.Goal;

const numberOfMobs = 200;

enum GroupType {
    Red = 0,
    Green = 1
}

const groupTypeValues = Object.values(GroupType) as number[];

export enum MobType {
    Skeleton = 'Skeleton',
    ElfArcher = 'ElfArcher'
}

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

export namespace MobsModule {
    const skeletonSaberConfig = {
        damageMax: 20,
        damageMin: 10,
        cooldownSeconds: 0.1,
        rangeMax: 100,
        rangeMin: 50,
        swingSeconds: 0.5,
        attackDuration: 0.75,
        criticalChance: 0.1,
        criticalMultiplier: 2,
        effect: WeaponEffect.DirectDamage
    };
    
    const elfArcherBowConfig = {
        damageMax: 20,
        damageMin: 10,
        cooldownSeconds: 1,
        rangeMax: 600,
        rangeMin: 300,
        swingSeconds: 0.5,
        attackDuration: 0.75,
        criticalChance: 0.3,
        criticalMultiplier: 3,
        effect: WeaponEffect.Arrow
    };
    
    const defaultState:Record<GoapState, boolean> = { [GoapState.hasTarget]: false, [GoapState.inRange]: false, [GoapState.overwhelmed]:false };
    
    export class MobSpawnSystem extends TimedGameSystem {
        protected updateTimed(entities: Set<number>, _: number): void {
            const mobsCounter = this.game.ecs.getComponent(Array.from(entities)[0], MobsCounter);
            
            while (this.game.mobs.size < mobsCounter.count) {
                const random = Math.random();
                const x = Math.floor(200 + Math.random() * 1000);
                const y = Math.floor(200 + Math.random() * 1000);
                const group:number = Math.random() > 0.5 ? 1 : 0;

                if (random < 0.5) {
                    this.makeSkeleton(x, y, group);
                } else {
                    this.makeElfArcher(x, y, group);
                }
            }
        }
        protected init(): void {
            this.componentsRequired = new Set([MobsCounter]);
        }
        
        public componentsRequired: Set<Function> = new Set([MobsCounter]);

        static addGoap(game: GameLogic, entity: number, actions: Action[], goals: Goal[]){
            game.ecs.addComponent(entity, new MobGoapStateComponent({...defaultState} as Record<GoapState, boolean>));
            game.ecs.addComponent(entity, new GoalsComponent(goals));
            game.ecs.addComponent(entity, new AvailableActionsComponent(actions));
            game.ecs.addComponent(entity, new ActionComponent());
        }

        static addTargeting(game: GameLogic, entity: number, ownGroup: number){
            // Targeting all groups except own
            game.ecs.addComponent(entity, new TargetSelection(groupTypeValues.filter(group => group !== ownGroup).reduce((acc, group) => acc.add(group), new Set<number>()) as Set<number>));
            game.ecs.addComponent(entity, new Targeted());
            game.ecs.addComponent(entity, new RangeFromTarget(0));
        }

        static addMovement(game: GameLogic, entity: number, speed: number){
            game.ecs.addComponent(entity, new GlideLocomotion(speed));
            game.ecs.addComponent(entity, new Steering());
        }

        static addCombat(game: GameLogic, entity: number, health:number, weaponConfig: WeaponConfig){
            game.ecs.addComponent(entity, new Health(health));
            game.ecs.addComponent(entity, new Weapon(weaponConfig));
        }
        
        static addPhysics(game: GameLogic, entity: number, x:number, y:number, size:number) {
            game.addPhysicalComponents(entity, x, y, size);
            game.mobs.add(entity);
        }
        
        static addCommonComponents(game: GameLogic, entity: number, group:number){
            game.ecs.addComponent(entity, new FrameLog.FrameLog());
            game.ecs.addComponent(entity, new Group(group));
        }
            
        public makeSkeleton(x: number, y: number, group: number){
            const game = this.game;
            const entity = game.ecs.addEntity();
            game.ecs.addComponent(entity, new Mob(MobType.Skeleton));
            
            // Common
            MobSpawnSystem.addCommonComponents(game, entity, group);
            
            // GOAP
            MobSpawnSystem.addGoap(game, entity, [new GetTargetAction(), new MoveAction(), new AttackAction()], [new KillEnemiesGoal()]);
            
            // Targeting
            MobSpawnSystem.addTargeting(game, entity, group);
            
            // Movement
            MobSpawnSystem.addMovement(game, entity, 200);
            
            // Combat
            MobSpawnSystem.addCombat(game, entity, 100, skeletonSaberConfig);
            
            // Physics
            MobSpawnSystem.addPhysics(game, entity, x, y, 16);
        }
        
        public makeElfArcher(x: number, y: number, group: number){
            const game = this.game;
            const entity = game.ecs.addEntity();
            game.ecs.addComponent(entity, new Mob(MobType.ElfArcher));
            
            // Common
            MobSpawnSystem.addCommonComponents(game, entity, group);

            // GOAP
            MobSpawnSystem.addGoap(game, entity, [new GetTargetAction(), new MoveAction(), new AttackAction(), new EscapeOverwhelmAction()], [new KillEnemiesGoal(), new EscapeOverwhelmGoal()]);

            // Overwhelm
            game.ecs.addComponent(entity, new OverwhelmComponent(2));

            // Targeting
            MobSpawnSystem.addTargeting(game, entity, group);

            // Movement
            MobSpawnSystem.addMovement(game, entity, 300);

            // Combat
            MobSpawnSystem.addCombat(game, entity, 100, elfArcherBowConfig);

            // Physics
            MobSpawnSystem.addPhysics(game, entity, x, y, 16);
        }
    }
    
    const updateInterval = 1;
    
    export class MobsModule extends GameLogicModule {
        public init(game: GameLogic): void {
            const mobsEntity = game.ecs.addEntity();
            game.ecs.addComponent(mobsEntity, new MobsCounter(numberOfMobs));
            
            const spawnSystem = new MobSpawnSystem(game, updateInterval);
            game.ecs.addSystem(spawnSystem);

            // while (game.mobs.size < numberOfMobs) {
            //     spawnSystem.makeSkeleton(Math.floor(200 + Math.random() * 400), Math.floor(200 + Math.random() * 400));
            // }
        }
    }
} 