import {Component} from "../../core/ECS.ts";
import {Mob, MobType} from "./MobsModule.ts";
import {GameLogic, GameLogicModule, GameSystem} from "../GameLogic.ts";
import {FrameLog} from "./FrameLog.ts";
import {PhysicsModule} from "./PhysicsModule.ts";
import Position = PhysicsModule.Position;

export class Health extends Component {
    maxValue: number;

    constructor(public value: number) {
        super();
        this.maxValue = value;
    }
}

export class Mortality extends Component {}

export class Corpse extends Component {
    public maxAge = 30;
    public age = 0;

    constructor(public type: MobType, public x: number, public y: number) {
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

export enum DropType {
    Corpse = 1,
    Coin = 2,
}

export interface DropDefinition {
    chance?: number;
    value?: number;
    type: DropType;
}

export class DieAndDrop extends Component {
    public constructor(public drops: DropDefinition[] = []) {
        super();
    }
}

class DeathSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Mortality]);

    protected init(): void {
        this.componentsRequired = new Set([Mortality]);
    }

    update(entities: Set<number>, _:number): void {
        const game = this.game;

        for (const entity of entities) {
            const health = game.ecs.getComponent(entity, Health);

            if (!health || health.value > 0) {
                continue;
            }

            const drops = game.ecs.getComponent(entity, DieAndDrop);
            if (drops){
                this.dropItems(game, entity, drops);
            }

            game.removePhysicalComponents(entity);
            game.mobs.delete(entity);
            game.ecs.removeEntity(entity);
        }
    }

    private dropCorpse(game: GameLogic, entity: number) {
        const position = game.ecs.getComponent(entity, Position);
        const mob = game.ecs.getComponent(entity, Mob);
        const frameLog = game.ecs.getComponent(entity, FrameLog.FrameLog);

        if (position && mob && frameLog){
            const corpseEntity = game.ecs.addEntity();
            game.ecs.addComponent(corpseEntity, new Corpse(mob.type, position.x, position.y));

            // Copy the frame log to the corpse
            const log = new FrameLog.FrameLog();
            log.logs = [...frameLog.logs];
            game.ecs.addComponent(corpseEntity, log);
        }
    }

    private dropItems(game: GameLogic, entity: number, drops: DieAndDrop) {
        for (const drop of drops.drops) {
            if (!drop.chance || Math.random() < drop.chance) {
                switch (drop.type) {
                    case DropType.Corpse:
                        this.dropCorpse(game, entity);
                        break;
                    case DropType.Coin:
                        console.log("Dropping coins not implemented");
                        break;
                }
            }
        }
    }
}

export class DeathModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const deathSystem = new DeathSystem(game);
        game.ecs.addSystem(deathSystem);

        const corpseRotSystem = new CorpseRotSystem(game);
        game.ecs.addSystem(corpseRotSystem);
    }
}