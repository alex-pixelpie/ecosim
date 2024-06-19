import {Action} from "./Action.ts";
import {GoapStateComponent, GoapStateConst} from "../GoapStateComponent.ts";
import {GameLogic} from "../../../GameLogic.ts";

export class StartAttackingEnemiesAction extends Action {
    preconditions = {[GoapStateConst.seeEnemies]: true, [GoapStateConst.isAttackingEnemy]: false};
    effects = {[GoapStateConst.isAttackingEnemy]: true, [GoapStateConst.hasMoveTarget]:true};
    cost: number = 10;
    type: string = StartAttackingEnemiesAction.name;
    
    override hasCompleted(entity: number, game: GameLogic): boolean {
        const areEffectsImplemented = super.hasCompleted(entity, game);
        return areEffectsImplemented || !game.ecs.getComponent(entity, GoapStateComponent)?.state[GoapStateConst.seeEnemies];
    }
}
