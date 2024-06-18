import {ActionProcessor} from "../systems/GoapActionProcessorSystem.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {TargetOfAttack} from "../../TargetingModule.ts";

export const processAttackAction: ActionProcessor = (game: GameLogic, entity: number): void => {
    const target = game.ecs.getComponent(entity, TargetOfAttack);

    if (!target?.attacking) {
        return;
    }

    // TODO - do the attack
}