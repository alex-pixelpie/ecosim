import { IUtilityBehavior, State } from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";
import {Looter} from "../LootModule.ts";
import {GroupAwareness} from "../SensoryModule.ts";
import {Position, Size} from "../PhaserPhysicsModule.ts";
import {MathUtils} from "../../../utils/Math.ts";
import {Steering} from "../SteeringModule.ts";

export class LootBehavior implements IUtilityBehavior {
    name: string = "Looting";
    group: number;
    
    getUtility(game: GameLogic, entity: number, state: State): number {
        return state.seeLoot ? 3 : -100;
    }
    
    execute(game: GameLogic, entity: number, state: State): void {
        const looter = game.ecs.getComponent(entity, Looter);
        if (!looter) {
            return;
        }

        if (!looter.looting) {
            LootBehavior.StartLooting(game, entity, looter);
            return;
        }
        
        const steering = game.ecs.getComponent(entity, Steering);
        const ownPosition = game.ecs.getComponent(entity, Position);
        if (!steering || !ownPosition) {
            return;
        }
        
        if (looter.inRange(ownPosition)) {
            steering.impulses = [];
            return;
        }
        
        const vectorToTarget = MathUtils.normalize(MathUtils.subtract(looter, ownPosition));
        const impulseToTarget = MathUtils.multiply(vectorToTarget, 1);
        
        steering.impulses.push(impulseToTarget);
    }

    updateState(game: GameLogic, entity: number, state: State): void {
        const senses = GroupAwareness.getAwareness(game.ecs, entity);
        if (!senses) {
            return;
        }
        state.seeLoot = senses?.loot.size > 0;
    }

    private static StartLooting(game: GameLogic, entity: number, looter: Looter) {
        const senses = GroupAwareness.getAwareness(game.ecs, entity);
        if (!senses) {
            return;
        }

        const position = game.ecs.getComponent(entity, Position);
        if (!position) {
            return;
        }

        const target = MathUtils.closestValue(position, senses.loot, senses.positions);

        if (target == undefined) {
            return;
        }

        const targetPosition = game.ecs.getComponent(target, Position);
        if (!targetPosition) {
            return;
        }

        const targetSize = game.ecs.getComponent(target, Size);
        looter.startLooting(target, targetSize?.radius || 10, targetPosition.x, targetPosition.y);
    }
    
    stop(game: GameLogic, entity: number, state: State) {
        const looter = game.ecs.getComponent(entity, Looter);
        if (!looter) {
            return;
        }

        looter.stopLooting();
    }
}
