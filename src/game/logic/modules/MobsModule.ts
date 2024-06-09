import {GameLogic, GameLogicModule} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";
import {MobGoapStateComponent} from "./goap/MobGoapStateComponent.ts";
import {MobGoapState} from "./goap/MobGoapState.ts";
import {GetTargetAction, TargetSelection} from "./goap/Targeting.ts";
import {GlideLocomotion, MoveAction, RangeFromTarget} from "./goap/Locomotion.ts";
import {GOAP} from "./goap/GoapModule.ts";
import {AttackAction, Health, Weapon} from "./goap/Attack.ts";

export namespace MobsModule {
    import GoalsComponent = GOAP.GoalsComponent;
    import KillEnemiesGoal = GOAP.KillEnemiesGoal;
    import AvailableActionsComponent = GOAP.AvailableActionsComponent;
    import ActionComponent = GOAP.ActionComponent;
    const numberOfMobs = 30;
    
    export enum MobType {
        Skeleton = 'Skeleton',
    }
    
    export class Mob extends Component {
        public constructor(public type: MobType) {
            super();
        }
    }
    
    export class MobsModule extends GameLogicModule {
        public init(game: GameLogic): void {
            for (let i = 0; i < numberOfMobs; i++) {
                this.makeSkeleton(game, Math.floor(200 + Math.random() * 400), Math.floor(200 + Math.random() * 400));
            }
        }
        
        makeSkeleton(game:GameLogic, x:number, y:number){
            const skeleton = game.ecs.addEntity();
            game.ecs.addComponent(skeleton, new Mob(MobType.Skeleton));
            game.ecs.addComponent(skeleton, new MobGoapStateComponent({ [MobGoapState.hasTarget]: false, [MobGoapState.inRange]: false }));
            game.ecs.addComponent(skeleton, new GoalsComponent([new KillEnemiesGoal()]));
            game.ecs.addComponent(skeleton, new AvailableActionsComponent([new GetTargetAction(), new MoveAction(), new AttackAction()]));
            game.ecs.addComponent(skeleton, new ActionComponent());
            game.ecs.addComponent(skeleton, new TargetSelection());
            game.ecs.addComponent(skeleton, new RangeFromTarget(50));
            game.ecs.addComponent(skeleton, new GlideLocomotion(100));
            game.ecs.addComponent(skeleton, new Health(100));
            game.ecs.addComponent(skeleton, new Weapon({
                damage: 10,
                cooldownSeconds: 1,
                range: 250,
                swingSeconds: 0.5,
                attackDuration: 0.75
            }));
            game.addPhysicalComponents(skeleton, x, y, 16);
            game.mobs.add(skeleton);
        }
    }
} 