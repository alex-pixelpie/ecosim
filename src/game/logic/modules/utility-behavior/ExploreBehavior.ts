import { IUtilityBehavior, State } from "./UtilityBehaviorModule.ts";
import {GameLogic} from "../../GameLogic.ts";
import {Component} from "../../../core/ECS.ts";
import {MathUtils, Pos} from "../../../utils/Math.ts";
import {Position} from "../PhaserPhysicsModule.ts";
import Vector2 = Phaser.Math.Vector2;
import {Observed} from "../SensoryModule.ts";
import {Configs} from "../../../configs/Configs.ts";
import {Steering} from "../SteeringModule.ts";

export class Explorer extends Component {
    public explorationTarget: Pos | null = null;
    group: number;

    constructor(public ownRadius: number) {
        super();
    }

    inRange(from: Pos): boolean {
        if (!this.explorationTarget) {
            return false;
        }
        
        let distance = MathUtils.distance(from, this.explorationTarget) - this.ownRadius;
        return distance <= 0;
    }
}

export class ExploreBehavior implements IUtilityBehavior {
    name: string = "Exploring";
    group: number;

    getUtility(game: GameLogic, entity: number, state: State): number {
        if (state.seeEnemies || state.seeLoot) {
            return 0;
        }
        
        return state.exploring ? 2 : 1;
    }
    
    execute(game: GameLogic, entity: number, state: State): void {
        const explorer = game.ecs.getComponent(entity, Explorer);
        if (!explorer) {
            state.exploring = false;
            return;
        }
        
        const position = game.ecs.getComponent(entity, Position);
        
        this.updateOrSelectTarget(game, entity, explorer, position);
        
        if (!explorer.explorationTarget) {
            state.exploring = false;
            return;
        }
        
        if (explorer.inRange(position)) {
            explorer.explorationTarget = null;
            state.exploring = false;
            return;
        }

        state.exploring = true;

        const steering = game.ecs.getComponent(entity, Steering);
        if (!steering){
            return;
        }
        
        const vectorToTarget = MathUtils.subtract(explorer.explorationTarget, position);
        const impulseToTarget = MathUtils.multiply(vectorToTarget, 1);

        steering.impulses.push(impulseToTarget);
    }

    updateState(game: GameLogic, entity: number, state: State): void {
        state.exploring = false;
    }

    private updateOrSelectTarget(game: GameLogic, entity: number, explorer: Explorer, position: Position) {
        var cycles = 0;
        var startAngle = Math.random() * Math.PI * 2;
        var samplesPerCycle = 10;
        var currentRadius = 500;
        var radiusStep = 100;
        
        while (!explorer.explorationTarget) {
            cycles++;
            if (cycles > 100) {
                return;
            }
            
            for (let i = 1; i <= samplesPerCycle; i++) {
                const angle = i * Math.PI * 2 + startAngle;
                const vector = new Vector2(Math.cos(angle), Math.sin(angle));
                const target = new Vector2(position.x, position.y).add(vector.clone().scale(currentRadius));

                if (this.getTileUnexplored(game, target, Configs.mapConfig.tilesInMapSide, Configs.mapConfig.tilesInMapSide, Configs.mapConfig.tileSize, explorer.group)) {
                    explorer.explorationTarget = {x: target.x, y: target.y};
                    return;
                }
            }
            
            currentRadius += radiusStep;
        }
    }
    
    private getTileUnexplored(game: GameLogic, position: Position, numRows: number, numCols: number, tileSize: number, group:number): boolean {
        const col = Math.floor(position.x / tileSize);
        const row = Math.floor(position.y / tileSize);
        const exploreOffset = 10;
        
        if (col >= exploreOffset && col < numCols-1 && row >= exploreOffset && row < numRows-exploreOffset) {
            const tile = game.ecs.getComponent(game.tiles[col][row], Observed);
            if (tile && !tile.lastSeen.has(group)) {
                return true;
            }
        }

        return false;
    }
}
