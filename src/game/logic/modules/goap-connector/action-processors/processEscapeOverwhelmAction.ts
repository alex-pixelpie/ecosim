import { GameLogic } from "../../../GameLogic.ts";
import { MathUtils } from "../../../../utils/Math.ts";
import { Steering } from "../../SteeringModule.ts";
import { Position } from "../../PhaserPhysicsModule.ts";
import { Targeted } from "../../TargetingModule.ts";
import { ActionProcessor } from "../systems/GoapToSteeringImpulsesSystem.ts";

export const processEscapeOverwhelmAction: ActionProcessor = (game: GameLogic, entity: number, intensity: number = 1): void => {
    const moveDesires = game.ecs.getComponent<Steering>(entity, Steering);
    const position = game.ecs.getComponent(entity, Position);
    const targeted = game.ecs.getComponent(entity, Targeted);

    if (!moveDesires || !position || !targeted) {
        return;
    }

    targeted.targetedBy.forEach(enemy => {
        const enemyPosition = game.ecs.getComponent(enemy, Position);
        if (!enemyPosition) {
            return;
        }

        const dir = MathUtils.multiply(MathUtils.normalize({
            x: position.x - enemyPosition.x,
            y: position.y - enemyPosition.y
        }), intensity);

        moveDesires.impulses.push(dir);
    });
};
