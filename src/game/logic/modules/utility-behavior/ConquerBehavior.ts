import {IUtilityBehavior, State} from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";
import {GroupAwareness} from "../SensoryModule.ts";
import {Position, Size} from "../PhaserPhysicsModule.ts";
import {Conquerable, Conqueror} from "../BuildingsModule.ts";
import {Steering} from "../SteeringModule.ts";
import {MathUtils} from "../../../utils/Math.ts";

export class ConquerBehavior implements IUtilityBehavior {
    name: string = "Conquering";
    group: number;

    public updateState(game: GameLogic, entity: number, state: State): void {
        const senses = GroupAwareness.getAwareness(game.ecs, entity);
        if (!senses) {
            return;
        }
        
        state.seeConquests = senses.conquests.size > 0;
    }

    public getUtility(game: GameLogic, entity: number, state: State): number {
        if (state.seeConquests) {
            return state.conquering ? 10 : 4;    
        }
        
        return -100;
    }

    public execute(game: GameLogic, entity: number, state: State, delta:number): void {
        const conqueror = game.ecs.getComponent(entity, Conqueror);

        if (!conqueror) {
            return;
        }

        if (conqueror.conquering) {
            this.processConquering(game, entity, conqueror, delta);
            return;
        }

        this.findTagret(game, entity, conqueror);
    }

    private processConquering(game: GameLogic, entity: number, conqueror: Conqueror, delta: number) {
        const targetPosition = game.ecs.getComponent(conqueror.target!, Position);
        conqueror.x = targetPosition.x;
        conqueror.y = targetPosition.y;

        const ownPosition = game.ecs.getComponent(entity, Position);
        if (conqueror.inRange(ownPosition!)){
            const conquerable = game.ecs.getComponent(conqueror.target!, Conquerable);
            if (!conquerable) {
                conqueror.stopConquering();
                return;
            }

            conquerable.conquestPoints += delta * conqueror.conquestPerSecond;
                
            return;
        }

        // Steer to target
        const steering = game.ecs.getComponent(entity, Steering);
        if (!steering){
            return;
        }

        const vectorToTarget = MathUtils.normalize(MathUtils.subtract(conqueror, ownPosition));
        const impulseToTarget = MathUtils.multiply(vectorToTarget, 1);
        steering.impulses.push(impulseToTarget);
        return;
    }

    private findTagret(game: GameLogic, entity: number, conqueror: Conqueror) {
        const awareness = GroupAwareness.getAwareness(game.ecs, entity);
        if (!awareness) {
            return;
        }

        let bestConquestValue = -Infinity;
        let bestConquestEntity = -1;

        awareness.conquests.forEach((points, entity) => {
            if (points > bestConquestValue) {
                bestConquestValue = points;
                bestConquestEntity = entity;
            }
        });

        if (bestConquestEntity === -1) {
            return;
        }

        const size = game.ecs.getComponent(bestConquestEntity, Size);
        const position = game.ecs.getComponent(bestConquestEntity, Position);
        if (!size || !position) {
            return;
        }

        conqueror.startConquering(bestConquestEntity, size.radius*4, position.x, position.y);
    }
}