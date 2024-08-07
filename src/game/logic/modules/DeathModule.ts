import {Component} from "../../core/ECS.ts";
import {Mob} from "./MobsModule.ts";
import {GameLogic, GameSystem} from "../GameLogic.ts";
import {GameLogicModule} from "../GameLogicModule.ts";
import {FrameLog} from "./FrameLogModule.ts";
import {Building} from "./BuildingsModule.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {DropDefinition, DropType, MobType} from "../../configs/MobsConfig.ts";
import {BuildingType} from "../../configs/BuildingsConfig.ts";
import {Loot, Lootable, LootType} from "./LootModule.ts";
import {Observable} from "./SensoryModule.ts";

export class Health extends Component {
    maxValue: number;

    constructor(public value: number) {
        super();
        this.maxValue = value;
    }
}

export class Corpse extends Component {
    public maxAge = 30;
    public age = 0;

    constructor(public type: MobType, public x: number, public y: number) {
        super();
    }
}

export class Ruin extends Component {
    public constructor(public type:BuildingType = BuildingType.MobTower, public x:number, public y:number) {
        super();
    }
}

class CorpseRotSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Corpse]);

    protected init(): void {
        this.componentsRequired = new Set([Corpse]);
    }

    update(entities: Set<number>, delta:number): void {
        for (const entity of entities) {
            const corpse = this.game.ecs.getComponent(entity, Corpse);
            if (!corpse){
                continue;
            }

            corpse.age+=delta;
            if (corpse.age > corpse.maxAge){
                this.game.ecs.removeEntity(entity);
            }
        }
    }
}

export class DieAndDrop extends Component {
    public constructor(public drops: DropDefinition[] = []) {
        super();
    }
}

export class Dead extends Component {}

class DeadRemovalSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Dead]);

    protected init(): void {
        this.componentsRequired = new Set([Dead]);
    }

    update(entities: Set<number>, _:number): void {
        for (const entity of entities) {
            this.game.ecs.removeEntity(entity);
        }
    }
}

class DropsSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Dead, DieAndDrop]);

    protected init(): void {
        this.componentsRequired = new Set([Dead, DieAndDrop]);
    }

    update(entities: Set<number>, _:number): void {
        for (const entity of entities) {
            const drops = this.game.ecs.getComponent(entity, DieAndDrop);
            for (const drop of drops.drops) {
                if (!drop.chance || Math.random() < drop.chance) {
                    switch (drop.type) {
                        case DropType.Corpse:
                            this.dropCorpse(entity);
                            break;
                        case DropType.Ruin:
                            this.dropRuin(entity);
                            break;
                        case DropType.Coin:
                            this.dropCoin(entity);
                            break;
                    }
                }
            }
        }
    }

    private dropCorpse(entity: number) {
        const position = this.game.ecs.getComponent(entity, Position);
        const mob = this.game.ecs.getComponent(entity, Mob);
        const frameLog = this.game.ecs.getComponent(entity, FrameLog);

        if (position && mob && frameLog){
            const corpseEntity = this.game.ecs.addEntity();
            this.game.ecs.addComponent(corpseEntity, new Corpse(mob.type, position.x, position.y));
            this.game.ecs.addComponent(corpseEntity, new Position(position.x, position.y));
            this.game.ecs.addComponent(corpseEntity, new Observable());

            this.game.ecs.removeComponent(entity, DieAndDrop);
            
            // Copy the frame log to the corpse
            const log = new FrameLog();
            log.logs = [...frameLog.logs];
            this.game.ecs.addComponent(corpseEntity, log);
        }
    }

    private dropRuin(entity: number) {
        const position = this.game.ecs.getComponent(entity, Position);
        const building = this.game.ecs.getComponent(entity, Building);
        const frameLog = this.game.ecs.getComponent(entity, FrameLog);

        if (position && building && frameLog){
            const ruinEntity = this.game.ecs.addEntity();
            this.game.ecs.addComponent(ruinEntity, new Ruin(building.config.type, position.x, position.y));
            this.game.ecs.addComponent(ruinEntity, new Observable());

            // Copy the frame log to the ruin
            const log = new FrameLog();
            log.logs = [...frameLog.logs];
            this.game.ecs.addComponent(ruinEntity, log);
        }
    }

    private dropCoin(entity: number, value: number = 1) {
        const position = this.game.ecs.getComponent(entity, Position);

        if (position){
            const coinEntity = this.game.ecs.addEntity();
            this.game.ecs.addComponent(coinEntity, new Loot(LootType.Coin, 10, value));
            this.game.ecs.addComponent(coinEntity, new Position(position.x, position.y));
            this.game.ecs.addComponent(coinEntity, new Lootable());
            this.game.ecs.addComponent(coinEntity, new Observable());
        }
    }
}

class DeathSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Health]);

    protected init(): void {
        this.componentsRequired = new Set([Health]);
    }

    update(entities: Set<number>, _:number): void {
        const game = this.game;

        for (const entity of entities) {
            const health = game.ecs.getComponent(entity, Health);

            if (!health || health.value > 0) {
                continue;
            }

            game.ecs.addComponent(entity, new Dead());
            game.removePhysicalComponents(entity);
            game.mobs.delete(entity);
        }
    }
}

export class DeathModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const deadRemovalSystem = new DeadRemovalSystem(game);
        game.ecs.addSystem(deadRemovalSystem);
        
        const deathSystem = new DeathSystem(game);
        game.ecs.addSystem(deathSystem);

        const dropsSystem = new DropsSystem(game);
        game.ecs.addSystem(dropsSystem);
        
        const corpseRotSystem = new CorpseRotSystem(game);
        game.ecs.addSystem(corpseRotSystem);
    }
}