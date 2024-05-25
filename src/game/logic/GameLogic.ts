import {Component, ECS, System} from "../core/ECS.ts";

const MAX_MOISTURE_IN_TILE = 1000;
const SEA_LEVEL = 2;
const MAP_SIZE = 120;

export abstract class GameSystem extends System {
    public constructor(public game: GameLogic) {
        super();
        this.game = game;
        this.init();
    }
    
    protected abstract init() : void;
}

export abstract class GameLogicModule {
    public abstract init(game: GameLogic): void;
}

export abstract class ValueComponent extends Component {
    public constructor(public value: number) {
        super();
    }
}

export class GameLogic {
    ecs: ECS;
    secondsFromLastTick: number = 0;
    timeFromStart: number = 0;
    config = {
        mapSize: MAP_SIZE,
        maxMoistureInTile: MAX_MOISTURE_IN_TILE,
        seaLevel: SEA_LEVEL,
        maxElevation: 5
    };
    
    constructor(ecs: ECS, modules: GameLogicModule[]) {
        this.ecs = ecs;
        modules.forEach(module => module.init(this));
    }
    
    update(delta: number) {
        this.secondsFromLastTick = delta/1000;
        this.timeFromStart += this.secondsFromLastTick;
        this.ecs.update();
    }
}
