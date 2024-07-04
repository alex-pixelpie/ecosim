import { IUtilityBehavior, State } from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";
import {GroupAwareness} from "../SensoryModule.ts";
import {Position, Size} from "../PhaserPhysicsModule.ts";
import {MathUtils} from "../../../utils/Math.ts";
import {TargetOfAttack} from "../TargetingModule.ts";
import {Weapon} from "../weapons/Weapons.ts";
import {Steering} from "../SteeringModule.ts";

export class FightBehavior implements IUtilityBehavior {
    name: string = "Attacking";
    group: number;

    getUtility(game: GameLogic, entity: number, state: State): number {
        if (state.attacking){
            return 10;
        }
        
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
        
        if (!game.mobs.has(attackTarget.target)){
            weapon.inUse = false;
            attackTarget.stopAttacking();
            return;
        }

        const senses = GroupAwareness.getAwareness(game.ecs, entity);
        const isVisible = senses?.enemies.has(attackTarget.target);

        if (isVisible){
            const targetPosition = game.ecs.getComponent(attackTarget.target, Position);
            if (!targetPosition){
                return;
            }
            attackTarget.x = targetPosition.x;
            attackTarget.y = targetPosition.y;
        }
        
        if (attackTarget.inRange(ownPosition)){
            if (isVisible){
                weapon.inUse = true;
                return;
            }
            weapon.inUse = false;
            attackTarget.stopAttacking();
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
        const senses = GroupAwareness.getAwareness(game.ecs, entity);
        if (!senses) {
            return;
        }
        state.seeEnemies = senses?.enemies.size > 0;
        state.attacking = game.ecs.getComponent(entity, TargetOfAttack)?.attacking || false;
    }

    private static ChooseTarget(game: GameLogic, entity: number, attackTarget: TargetOfAttack) {
        const senses = GroupAwareness.getAwareness(game.ecs, entity);
        if (!senses) {
            return;
        }
        
        const position = game.ecs.getComponent(entity, Position);
        if (!position) {
            return;
        }
        
        const target = MathUtils.closestValue(position, senses.enemies, senses.positions);

        if (target == undefined) {
            return;
        }

        const targetPosition = game.ecs.getComponent(target, Position);
        const targetSize = game.ecs.getComponent(target, Size);

        if (!targetPosition || !targetSize) {
            return;
        }
        
        attackTarget.attack(target, targetSize?.radius, targetPosition.x, targetPosition.y);
    }
}
