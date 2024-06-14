import {GameLogic, GameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {Component} from "../../core/ECS.ts";
import {Weapon} from "./weapons/Weapons.ts";
import {Health} from "./DeathModule.ts";
import {Targeted} from "./TargetingModule.ts";

export class OverwhelmComponent implements Component {
    public overwhelmed: boolean = false;
    public constructor(public remainingSurvivalSecondsToOverwhelm: number) {}
}

class OverwhelmSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([OverwhelmComponent, Targeted]);

    protected init(): void {
        this.componentsRequired = new Set([OverwhelmComponent, Targeted]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const overwhelmed = this.game.ecs.getComponent(entity, OverwhelmComponent);
            const targeted = this.game.ecs.getComponent(entity, Targeted);
            
            if (!targeted.targetedBy.length) {
                overwhelmed.overwhelmed = false;
                return;
            }
            
            const totalDps = targeted.targetedBy.reduce((acc, e) => {
                const weapon = this.game.ecs.getComponent(e, Weapon);
                return acc + (weapon?.isInUse ? weapon.dps : 0);
            }, 0);
            
            if (totalDps === 0) {
                overwhelmed.overwhelmed = false;
                return;
            }
            
            const health = this.game.ecs.getComponent(entity, Health);
            if ((health?.value || 0) <= totalDps * overwhelmed.remainingSurvivalSecondsToOverwhelm) {
                overwhelmed.overwhelmed = true;
            }
        });
    }
}

export class OverwhelmModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const overwhelmedSystem = new OverwhelmSystem(game);
        game.ecs.addSystem(overwhelmedSystem);
    }
}