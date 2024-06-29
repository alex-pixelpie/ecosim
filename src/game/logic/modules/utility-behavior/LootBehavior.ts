import { IUtilityBehavior, State } from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";
import {Looter} from "../LootModule.ts";
import {Senses} from "../SensoryModule.ts";
import {Position, Size} from "../PhaserPhysicsModule.ts";
import {MathUtils} from "../../../utils/Math.ts";
import {Steering} from "../SteeringModule.ts";

export class LootBehavior implements IUtilityBehavior {
    name: string = "Looting";

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
        const senses = game.ecs.getComponent(entity, Senses);
        state.seeLoot = senses?.lootablesInRange.length > 0;
    }

    private static StartLooting(game: GameLogic, entity: number, looter: Looter) {
        const senses = game.ecs.getComponent(entity, Senses);
        if (!senses) {
            return;
        }

        const position = game.ecs.getComponent(entity, Position);
        if (!position) {
            return;
        }

        const targets = senses.lootablesInRange.sort((a, b) => {
            const aPosition = game.ecs.getComponent(a, Position);
            const bPosition = game.ecs.getComponent(b, Position);
            if (!aPosition || !bPosition) {
                return 0;
            }
            const distanceA = MathUtils.distance(aPosition, position);
            const distanceB = MathUtils.distance(bPosition, position);
            return distanceA - distanceB;
        });

        const target = targets[0];
        if (!target) {
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
