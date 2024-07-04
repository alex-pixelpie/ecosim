import {GameLogicModule} from "../GameLogicModule.ts";
import {GameLogic, GameSystem} from "../GameLogic.ts";
import {MathUtils, Pos} from "../../utils/Math.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {Component} from "../../core/ECS.ts";
import {FrameLog, FrameLogType} from "./FrameLogModule.ts";

export enum LootType {
    Coin = "coin",
}

export class Loot extends Component {
    public constructor(public type: LootType, public size:number = 10, public value: number = 1) {
        super();
    }
}

export class Inventory extends Component {
    public coins: number = 0;
    
    public constructor() {
        super();
    }
}

export class Looter implements Component {
    get looting(): boolean {
        return this.target != null;
    }

    target: number | null = null;
    x: number = 0;
    y: number = 0;
    targetSize: number = 0;

    constructor(public ownSize:number) {}

    startLooting(target: number, targetSize:number, x:number, y:number): void {
        this.target = target;
        this.targetSize = targetSize/2;
        this.x = x;
        this.y = y;
    }

    stopLooting(){
        this.target = null;
    }

    inRange(from: Pos): boolean {
        let distance = Math.floor(MathUtils.distance(from, this) - this.targetSize);
        return distance <= this.ownSize*2;
    }
}

export class Lootable extends Component {}

class LootingSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Looter]);
    
    protected init(): void {
        this.componentsRequired = new Set([Looter]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const looter = this.game.ecs.getComponent(entity, Looter);
            if (!looter || !looter.looting) {
                return;
            }
            
            const position = this.game.ecs.getComponent(entity, Position);
            if (!position) {
                return;
            }
            
            if (looter.inRange(position)) {
                this.grabLoot(entity, looter);
            }
        });
    }
    
    private grabLoot(entity:number, looter: Looter): void {
        const inventory = this.game.ecs.getComponent(entity, Inventory);
        if (!inventory) {
            looter.stopLooting();
            return;
        }

        const loot = this.game.ecs.getComponent(looter.target!, Loot);

        // TODO - handle non-coin loot
        inventory.coins += loot.value;

        this.game.ecs.removeEntity(looter.target!);
        looter.stopLooting();

        const log = this.game.ecs.getComponent(entity, FrameLog);
        if (log) {
            log.logs.push({
                type: FrameLogType.CollectCoins,
                value: loot.value,
                timestamp: this.game.time,
            });
        }
    }
}

export class LootModule extends GameLogicModule {
    public init(game:GameLogic): void {
        const lootingSystem = new LootingSystem(game);
        game.ecs.addSystem(lootingSystem);
    }
}