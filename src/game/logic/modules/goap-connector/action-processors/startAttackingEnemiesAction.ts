import {ActionProcessor} from "../systems/GoapActionProcessorSystem.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {MathUtils} from "../../../../utils/Math.ts";
import {TargetOfAttack, TargetGroup, Targeting} from "../../TargetingModule.ts";
import {Senses} from "../../SensoryModule.ts";
import {Position, Size} from "../../PhaserPhysicsModule.ts";
import {LocomotionTarget} from "../../LocomotionModule.ts";

export const startAttackingEnemiesAction: ActionProcessor = (game: GameLogic, entity: number): void => {
    const attackTarget = game.ecs.getComponent(entity, TargetOfAttack);

    if (!attackTarget || attackTarget.attacking) {
        return;
    }

    const senses = game.ecs.getComponent(entity, Senses);
    if (!senses) {
        return;
    }
    
    const targeting = game.ecs.getComponent(entity, Targeting);
    if (!targeting) {
        return;
    }
    
    const targets = senses.entitiesInRange.filter(target => {
        const targetGroup = game.ecs.getComponent(target, TargetGroup);
        return targeting.targetGroups.has(targetGroup?.id);
    }).sort((a, b) => {
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
    const targetSize = game.ecs.getComponent(target, Size);
    
    attackTarget.attack(target, targetSize?.radius, targetPosition.x, targetPosition.y);
    
    const inRange = attackTarget.inRange(game.ecs.getComponent(entity, Position));
    if (inRange) {
        return;
    }
    
    const ownLocomotionTarget = game.ecs.getComponent(entity, LocomotionTarget);
    if (!ownLocomotionTarget) {
        return;
    }
    
    ownLocomotionTarget.x = targetPosition.x;
    ownLocomotionTarget.y = targetPosition.y;
}