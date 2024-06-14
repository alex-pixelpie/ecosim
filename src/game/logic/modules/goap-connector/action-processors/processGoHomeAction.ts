import {ActionProcessor} from "../systems/GoapToSteeringImpulsesSystem.ts";
import {Steering} from "../../SteeringModule.ts";
import {Position} from "../../PhaserPhysicsModule.ts";
import {Home} from "../../BuildingsModule.ts";
import {MathUtils} from "../../../../utils/Math.ts";

export const processGoHomeAction:ActionProcessor = (game, entity) => {
    const steering = game.ecs.getComponent(entity, Steering);
    const position = game.ecs.getComponent(entity, Position);
    const home = game.ecs.getComponent(entity, Home);
    
    if (!steering || !position || !home) {
        return;
    }

    const isSafe = home.isSafe(position);
    if (isSafe) {
        return;
    }
    
    const dir = MathUtils.normalize({
        x: home.x - position.x,
        y: home.y - position.y
    });
    
    const distance = home.distance(position);
    const intensity = Math.min(1, distance / home.safeDistance);
    
    steering.impulses.push(MathUtils.multiply(dir, intensity));
}