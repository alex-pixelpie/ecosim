import {GameLogic, GameLogicModule, TimedGameSystem} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";
import {MobGoapStateComponent} from "./goap/MobGoapStateComponent.ts";
import {MobGoapState} from "./goap/MobGoapState.ts";
import {GOAP} from "./goap/GoapModule.ts";
import {AttackAction} from "./goap/AttackAction.ts";
import {Health} from "./weapons/Attack.ts";
import {Weapon, WeaponEffect} from "./weapons/Weapons.ts";
import {Steering} from "./SteeringModule.ts";
import {FrameLog} from "./FrameLog.ts";
import {GetTargetAction} from "./goap/GetTargetAction.ts";
import {MoveAction} from "./goap/MoveAction.ts";
import {RangeFromTarget, TargetSelection} from "./Targeting.ts";
import {GlideLocomotion} from "./Locomotion.ts";

export namespace MobsModule {
    import GoalsComponent = GOAP.GoalsComponent;
    import KillEnemiesGoal = GOAP.KillEnemiesGoal;
    import AvailableActionsComponent = GOAP.AvailableActionsComponent;
    import ActionComponent = GOAP.ActionComponent;
    const numberOfMobs = 20;
    
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
    
    export class MobSpawnSystem extends TimedGameSystem {
        protected updateTimed(entities: Set<number>, _: number): void {
            const mobsCounter = this.game.ecs.getComponent(Array.from(entities)[0], MobsCounter);
            
            while (this.game.mobs.size < mobsCounter.count) {
                const random = Math.random();
                if (random < 0.5) {
                    this.makeSkeleton(Math.floor(200 + Math.random() * 400), Math.floor(200 + Math.random() * 400));
                } else {
                    this.makeElfArcher(Math.floor(200 + Math.random() * 400), Math.floor(200 + Math.random() * 400));
                }
            }
        }
        protected init(): void {
            this.componentsRequired = new Set([MobsCounter]);
        }
        
        public componentsRequired: Set<Function> = new Set([MobsCounter]);

        public makeSkeleton(x:number, y:number){
            const game = this.game;
            const entity = game.ecs.addEntity();
            game.ecs.addComponent(entity, new Mob(MobType.Skeleton));
            game.ecs.addComponent(entity, new FrameLog.FrameLog());
            game.ecs.addComponent(entity, new MobGoapStateComponent({ [MobGoapState.hasTarget]: false, [MobGoapState.inRange]: false }));
            game.ecs.addComponent(entity, new GoalsComponent([new KillEnemiesGoal()]));
            game.ecs.addComponent(entity, new AvailableActionsComponent([new GetTargetAction(), new MoveAction(), new AttackAction()]));
            game.ecs.addComponent(entity, new ActionComponent());
            game.ecs.addComponent(entity, new TargetSelection());
            game.ecs.addComponent(entity, new RangeFromTarget(75));
            game.ecs.addComponent(entity, new GlideLocomotion(200));
            game.ecs.addComponent(entity, new Steering());
            game.ecs.addComponent(entity, new Health(100));
            game.ecs.addComponent(entity, new Weapon({
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
            }));
            game.addPhysicalComponents(entity, x, y, 16);
            game.mobs.add(entity);
        }
        
        public makeElfArcher(x:number, y:number){
            const game = this.game;
            const entity = game.ecs.addEntity();
            game.ecs.addComponent(entity, new Mob(MobType.ElfArcher));
            game.ecs.addComponent(entity, new FrameLog.FrameLog());
            game.ecs.addComponent(entity, new MobGoapStateComponent({ [MobGoapState.hasTarget]: false, [MobGoapState.inRange]: false }));
            game.ecs.addComponent(entity, new GoalsComponent([new KillEnemiesGoal()]));
            game.ecs.addComponent(entity, new AvailableActionsComponent([new GetTargetAction(), new MoveAction(), new AttackAction()]));
            game.ecs.addComponent(entity, new ActionComponent());
            game.ecs.addComponent(entity, new TargetSelection());
            game.ecs.addComponent(entity, new RangeFromTarget(500));
            game.ecs.addComponent(entity, new GlideLocomotion(200));
            game.ecs.addComponent(entity, new Steering());
            game.ecs.addComponent(entity, new Health(100));
            game.ecs.addComponent(entity, new Weapon({
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
            }));
            game.addPhysicalComponents(entity, x, y, 16);
            game.mobs.add(entity);
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