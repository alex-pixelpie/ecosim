import { GameLogic } from "../../../GameLogic.ts";
import { MathUtils } from "../../../../utils/Math.ts";
import { Steering } from "../../SteeringModule.ts";
import { Position } from "../../PhaserPhysicsModule.ts";
import { RangeFromTarget, TargetSelection } from "../../TargetingModule.ts";
import { Configs } from "../../../../configs/Configs.ts";
import { ActionProcessor } from "../systems/GoapToSteeringImpulsesSystem.ts";

export const processMoveAction: ActionProcessor = (game: GameLogic, entity: number, intensity: number = 1) => {
    const steering = game.ecs.getComponent(entity, Steering);
    const rangeFromTarget = game.ecs.getComponent(entity, RangeFromTarget);
    const position = game.ecs.getComponent(entity, Position);
    const targetSelection = game.ecs.getComponent(entity, TargetSelection);

    if (!steering || !rangeFromTarget || !position || !targetSelection?.target) {
        return;
    }

    const tooClose = rangeFromTarget.tooClose(position, targetSelection, targetSelection.targetSize);
    const tooFar = rangeFromTarget.tooFar(position, targetSelection, targetSelection.targetSize);

    if (tooClose) {
        const dir = MathUtils.multiply(MathUtils.normalize({
            x: position.x - targetSelection.x,
            y: position.y - targetSelection.y
        }), intensity);
        steering.impulses.push(dir);
    } else if (tooFar) {
        const dir = MathUtils.multiply(MathUtils.normalize({
            x: targetSelection.x - position.x,
            y: targetSelection.y - position.y
        }), intensity);
        steering.impulses.push(dir);
    }

    avoidWalls(steering, position);
};

export const avoidWalls = (steering: Steering, position: Position): void => {
    // Add wall avoidance
    const avoidanceIntensity = 1; // Adjust this value based on desired avoidance strength
    const wallProximityThreshold = steering.mapEdgeProximityThreshold;

    const size = Configs.mapConfig.pixelsSize;

    const worldWidth = size;
    const worldHeight = size;

    // Calculate nearest point on each wall
    const nearestPointToLeftWall = { x: 0, y: position.y };
    const nearestPointToRightWall = { x: worldWidth, y: position.y };
    const nearestPointToTopWall = { x: position.x, y: 0 };
    const nearestPointToBottomWall = { x: position.x, y: worldHeight };

    // Calculate distances to the nearest point on each wall
    const distanceToLeftWall = Math.hypot(position.x - nearestPointToLeftWall.x, position.y - nearestPointToLeftWall.y);
    const distanceToRightWall = Math.hypot(position.x - nearestPointToRightWall.x, position.y - nearestPointToRightWall.y);
    const distanceToTopWall = Math.hypot(position.x - nearestPointToTopWall.x, position.y - nearestPointToTopWall.y);
    const distanceToBottomWall = Math.hypot(position.x - nearestPointToBottomWall.x, position.y - nearestPointToBottomWall.y);

    // Calculate avoidance impulses based on proximity to nearest point on walls
    if (distanceToLeftWall < wallProximityThreshold) {
        const intensity = avoidanceIntensity * (1 - distanceToLeftWall / wallProximityThreshold);
        const impulse = { x: intensity, y: 0 };
        steering.impulses.push(impulse);
    }
    if (distanceToRightWall < wallProximityThreshold) {
        const intensity = avoidanceIntensity * (1 - distanceToRightWall / wallProximityThreshold);
        const impulse = { x: -intensity, y: 0 };
        steering.impulses.push(impulse);
    }
    if (distanceToTopWall < wallProximityThreshold) {
        const intensity = avoidanceIntensity * (1 - distanceToTopWall / wallProximityThreshold);
        const impulse = { x: 0, y: intensity };
        steering.impulses.push(impulse);
    }
    if (distanceToBottomWall < wallProximityThreshold) {
        const intensity = avoidanceIntensity * (1 - distanceToBottomWall / wallProximityThreshold);
        const impulse = { x: 0, y: -intensity };
        steering.impulses.push(impulse);
    }
};
