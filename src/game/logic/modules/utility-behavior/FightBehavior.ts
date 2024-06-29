import { IUtilityBehavior, State } from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";
import {Senses} from "../SensoryModule.ts";
import {Position, Size} from "../PhaserPhysicsModule.ts";
import {MathUtils} from "../../../utils/Math.ts";
import {TargetGroup, Targeting, TargetOfAttack} from "../TargetingModule.ts";
import {Weapon} from "../weapons/Weapons.ts";
import {Steering} from "../SteeringModule.ts";

export class FightBehavior implements IUtilityBehavior {
    name: string = "Attacking";

    getUtility(game: GameLogic, entity: number, state: State): number {
        return state.seeEnemies ? 6 : -100;
    }
    
    execute(game: GameLogic, entity: number, state: State): void {
        const attackTarget = game.ecs.getComponent(entity, TargetOfAttack);
        const ownPosition = game.ecs.getComponent(entity, Position);
        
        if (!attackTarget || !ownPosition) {
            return;
        }

        const weapon = game.ecs.getComponent(entity, Weapon);
        if (!weapon){
            return;
        }
        
        if (!attackTarget.target){
            weapon.inUse = false;
            FightBehavior.ChooseTarget(game, entity, attackTarget);
            return;
        }
        
        const targetPosition = game.ecs.getComponent(attackTarget.target, Position);
        if (!targetPosition){
            return;
        }
        
        attackTarget.x = targetPosition.x;
        attackTarget.y = targetPosition.y;
        
        if (attackTarget.inRange(ownPosition)){
            weapon.inUse = true;
            return;
        }
        
        // Steering
        const steering = game.ecs.getComponent(entity, Steering);
        if (!steering){
            return;
        }
        
        const tooClose = attackTarget.tooClose(ownPosition);
        const vectorToTarget = MathUtils.normalize(tooClose ? MathUtils.subtract(ownPosition, attackTarget) : MathUtils.subtract(attackTarget, ownPosition));
        const impulseToTarget = MathUtils.multiply(vectorToTarget, 1);
        
        steering.impulses.push(impulseToTarget);
    }

    updateState(game: GameLogic, entity: number, state: State): void {
        const senses = game.ecs.getComponent(entity, Senses);
        state.seeEnemies = senses?.targetablesInRange.length > 0;
    }

    private static ChooseTarget(game: GameLogic, entity: number, attackTarget: TargetOfAttack) {
        const senses = game.ecs.getComponent(entity, Senses);
        if (!senses) {
            return;
        }

        const targeting = game.ecs.getComponent(entity, Targeting);
        if (!targeting) {
            return;
        }

        const targets = senses.targetablesInRange.filter(target => {
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
    }
}
