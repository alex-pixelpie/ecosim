import {ActionProcessor} from "../systems/GoapActionProcessorSystem.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {MathUtils} from "../../../../utils/Math.ts";
import {Senses} from "../../SensoryModule.ts";
import {Position, Size} from "../../PhaserPhysicsModule.ts";
import {LocomotionTarget} from "../../LocomotionModule.ts";
import {Looter} from "../../LootModule.ts";

export const startLootingAction: ActionProcessor = (game: GameLogic, entity: number): void => {
    const looter = game.ecs.getComponent(entity, Looter);

    if (!looter || looter.looting) {
        return;
    }

    const senses = game.ecs.getComponent(entity, Senses);
    if (!senses) {
        return;
    }
    
    const targets = senses.lootablesInRange.sort((a, b) => {
        const aPosition = game.ecs.getComponent(a, Position);
        const bPosition = game.ecs.getComponent(b, Position);
        if (!aPosition || !bPosition) {
            return 0;
        }
        const distanceA = MathUtils.distance(aPosition, game.ecs.getComponent(entity, Position));
        const distanceB = MathUtils.distance(bPosition, game.ecs.getComponent(entity, Position));
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
    
    const inRange = looter.inRange(game.ecs.getComponent(entity, Position));
    if (inRange) {
        return;
    }
    
    const ownLocomotionTarget = game.ecs.getComponent(entity, LocomotionTarget);
    if (!ownLocomotionTarget) {
        return;
    }
    
    ownLocomotionTarget.x = targetPosition.x;
    ownLocomotionTarget.y = targetPosition.y;
    ownLocomotionTarget.minDistance = 0;
}