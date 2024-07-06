import { IUtilityBehavior, State } from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";
import {GroupAwareness} from "../SensoryModule.ts";
import {Position, Size} from "../PhaserPhysicsModule.ts";
import {MathUtils} from "../../../utils/Math.ts";
import {Attacker} from "../TargetingModule.ts";
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
        const attack = game.ecs.getComponent(entity, Attacker);
        
        if (!attack) {
            return;
        }

        const weapon = game.ecs.getComponent(entity, Weapon);
        if (!weapon){
            return;
        }
        
        if (!attack.target){
            weapon.inUse = false;
            FightBehavior.ChooseTarget(game, entity, attack);
            return;
        }
        
        if (!game.mobs.has(attack.target)){
            weapon.inUse = false;
            attack.stopAttacking();
            return;
        }

        const senses = GroupAwareness.getAwareness(game.ecs, entity);
        const isVisible = senses?.enemies.has(attack.target);

        if (isVisible){
            const targetPosition = game.ecs.getComponent(attack.target, Position);
            if (!targetPosition){
                return;
            }
            attack.x = targetPosition.x;
            attack.y = targetPosition.y;
        }

        const ownPosition = game.ecs.getComponent(entity, Position);
        if (!ownPosition){
            return;
        }

        if (attack.inRange(ownPosition)){
            if (isVisible){
                weapon.inUse = true;
                return;
            }
            weapon.inUse = false;
            attack.stopAttacking();
        }
        
        // Steering
        const steering = game.ecs.getComponent(entity, Steering);
        if (!steering){
            return;
        }
        
        const tooClose = attack.tooClose(ownPosition);
        const vectorToTarget = MathUtils.normalize(tooClose ? MathUtils.subtract(ownPosition, attack) : MathUtils.subtract(attack, ownPosition));
        const impulseToTarget = MathUtils.multiply(vectorToTarget, 1);
        
        steering.impulses.push(impulseToTarget);
    }

    updateState(game: GameLogic, entity: number, state: State): void {
        const senses = GroupAwareness.getAwareness(game.ecs, entity);
        if (!senses) {
            return;
        }
        state.seeEnemies = senses?.enemies.size > 0;
        state.attacking = game.ecs.getComponent(entity, Attacker)?.attacking || false;
    }

    private static ChooseTarget(game: GameLogic, entity: number, attackTarget: Attacker) {
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
