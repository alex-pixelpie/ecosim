import {ActionProcessor} from "../systems/GoapActionProcessorSystem.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {TargetOfAttack} from "../../TargetingModule.ts";
import { Weapon } from "../../weapons/Weapons.ts";

export const processAttackAction: ActionProcessor = (game: GameLogic, entity: number): void => {
    const target = game.ecs.getComponent(entity, TargetOfAttack);

    if (!target?.attacking) {
        return;
    }

    const weapon = game.ecs.getComponent(entity, Weapon);
    weapon.isInUse = true;
}