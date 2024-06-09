import {GameLogic, GameLogicModule, TimedGameSystem} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";
import {MobGoapStateComponent} from "./goap/MobGoapStateComponent.ts";
import {MobGoapState} from "./goap/MobGoapState.ts";
import {GetTargetAction, TargetSelection} from "./goap/Targeting.ts";
import {GlideLocomotion, MoveAction, RangeFromTarget} from "./goap/Locomotion.ts";
import {GOAP} from "./goap/GoapModule.ts";
import {AttackAction, Health, Weapon} from "./goap/Attack.ts";
import {FrameLog} from "./goap/FrameLog.ts";

export namespace MobsModule {
    import GoalsComponent = GOAP.GoalsComponent;
    import KillEnemiesGoal = GOAP.KillEnemiesGoal;
    import AvailableActionsComponent = GOAP.AvailableActionsComponent;
    import ActionComponent = GOAP.ActionComponent;
    const numberOfMobs = 120;
    
    export enum MobType {
        Skeleton = 'Skeleton',
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
                this.makeSkeleton(Math.floor(200 + Math.random() * 400), Math.floor(200 + Math.random() * 400));
            }
        }
        protected init(): void {
            this.componentsRequired = new Set([MobsCounter]);
        }
        
        public componentsRequired: Set<Function> = new Set([MobsCounter]);
        
        public makeSkeleton(x:number, y:number){
            const game = this.game;
            const skeleton = game.ecs.addEntity();
            game.ecs.addComponent(skeleton, new Mob(MobType.Skeleton));
            game.ecs.addComponent(skeleton, new FrameLog.FrameLog());
            game.ecs.addComponent(skeleton, new MobGoapStateComponent({ [MobGoapState.hasTarget]: false, [MobGoapState.inRange]: false }));
            game.ecs.addComponent(skeleton, new GoalsComponent([new KillEnemiesGoal()]));
            game.ecs.addComponent(skeleton, new AvailableActionsComponent([new GetTargetAction(), new MoveAction(), new AttackAction()]));
            game.ecs.addComponent(skeleton, new ActionComponent());
            game.ecs.addComponent(skeleton, new TargetSelection());
            game.ecs.addComponent(skeleton, new RangeFromTarget(75));
            game.ecs.addComponent(skeleton, new GlideLocomotion(200));
            game.ecs.addComponent(skeleton, new Health(100));
            game.ecs.addComponent(skeleton, new Weapon({
                damageMax: 20,
                damageMin: 10,
                cooldownSeconds: 0.1,
                range: 100,
                swingSeconds: 0.5,
                attackDuration: 0.75,
                criticalChance: 0.1,
                criticalMultiplier: 2
            }));
            game.addPhysicalComponents(skeleton, x, y, 16);
            game.mobs.add(skeleton);
        }
    }
    
    const updateInterval = 3;
    
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