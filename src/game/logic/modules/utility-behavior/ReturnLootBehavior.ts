import {IUtilityBehavior, State} from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";
import {GroupAwareness, GroupLoot} from "../SensoryModule.ts";
import {Position, Size} from "../PhaserPhysicsModule.ts";
import {LootReturner} from "../BuildingsModule.ts";
import {Steering} from "../SteeringModule.ts";
import {MathUtils} from "../../../utils/Math.ts";
import { Inventory } from "../LootModule.ts";

const MAX_LOOT = 5;

export class ReturnLootBehavior implements IUtilityBehavior {
    name: string = "Returning Loot";
    group: number;

    public updateState(game: GameLogic, entity: number, state: State): void {
        const senses = GroupAwareness.getAwareness(game.ecs, entity);
        if (!senses) {
            return;
        }
        
        state.seeReturnLootTargets = senses.lootReturnTargets.size > 0;
        
        const inventory = game.ecs.getComponent(entity, Inventory);
        state.hasEnoughLoot = inventory?.coins >= MAX_LOOT;
    }

    public getUtility(game: GameLogic, entity: number, state: State): number {
        if (state.hasEnoughLoot) {
            return 9;    
        }
        
        return -100;
    }

    public execute(game: GameLogic, entity: number, state: State, delta:number): void {
        const lootReturner = game.ecs.getComponent(entity, LootReturner);

        if (!lootReturner) {
            return;
        }

        if (lootReturner.returningLoot) {
            this.processReturningLoot(game, entity, lootReturner, delta);
            return;
        }

        this.findTarget(game, entity, lootReturner);
    }

    private processReturningLoot(game: GameLogic, entity: number, lootReturner: LootReturner, delta: number) {
        const targetPosition = game.ecs.getComponent(lootReturner.target!, Position);
        lootReturner.x = targetPosition.x;
        lootReturner.y = targetPosition.y;

        const ownPosition = game.ecs.getComponent(entity, Position);
        if (lootReturner.inRange(ownPosition!)){
            const inventory = game.ecs.getComponent(entity, Inventory);
            if (!inventory) {
                lootReturner.finishReturningLoot();
                return;
            }
            
            const groupLoot = GroupLoot.getGroupLoot(game.ecs, entity);
            groupLoot.returnLoot(inventory);
            lootReturner.finishReturningLoot();
        }

        // Steer to target
        const steering = game.ecs.getComponent(entity, Steering);
        if (!steering){
            return;
        }

        const vectorToTarget = MathUtils.normalize(MathUtils.subtract(lootReturner, ownPosition));
        const impulseToTarget = MathUtils.multiply(vectorToTarget, 1);
        steering.impulses.push(impulseToTarget);
        return;
    }

    private findTarget(game: GameLogic, entity: number, lootReturner: LootReturner) {
        const awareness = GroupAwareness.getAwareness(game.ecs, entity);
        if (!awareness) {
            return;
        }

        const position = game.ecs.getComponent(entity, Position);
        const target = MathUtils.closestValue(position, awareness.lootReturnTargets, awareness.positions);

        if (!target) {
            return;
        }
        
        const targetPosition = game.ecs.getComponent(target, Position);
        if (!targetPosition) {
            return;
        }
        
        const targetSize = game.ecs.getComponent(target, Size);
        if (!targetSize) {
            return;
        }

        lootReturner.startReturningLootTo(target, targetSize.radius, targetPosition.x, targetPosition.y);
    }
}