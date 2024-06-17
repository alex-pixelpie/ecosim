import {GameLogic, GameSystem} from "../GameLogic.ts";
import { GameLogicModule } from "../GameLogicModule.ts";
import {EventBus, GameEvents} from "../../EventBus.ts";
import {Component} from "../../core/ECS.ts";
import {GlideLocomotion} from "./LocomotionModule.ts";
import {Steering} from "./SteeringModule.ts";
import {Position} from "./PhaserPhysicsModule.ts";
import {MobsSpawn} from "./MobsModule.ts";
import {AttackTarget} from "./TargetingModule.ts";
import {defaultGoapState, GoapStateComponent} from "./goap/GoapStateComponent.ts";
import {ActionComponent} from "./goap/GoapModule.ts";
import {Configs} from "../../configs/Configs.ts";

export class GameOverAgent extends Component {
    constructor(public victory: boolean) {
        super();
    }    
}

class SlowOnApproach extends Component {
    constructor(public startSlowDistance: number = 300) {
        super();
    }
}

class SlowOnApproachSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([GlideLocomotion]);
    protected init(): void {
        this.componentsRequired = new Set([SlowOnApproach]);
    }
    
    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const attackTarget = this.game.ecs.getComponent(entity, AttackTarget);
            const locomotion = this.game.ecs.getComponent(entity, GlideLocomotion);
            const position = this.game.ecs.getComponent(entity, Position);
            const slowOnApproach = this.game.ecs.getComponent(entity, SlowOnApproach);
            
            if (!attackTarget || !locomotion || !position || !slowOnApproach) {
                return;
            }
            
            const distance = attackTarget.distanceFromTarget(position);
            const distanceToSlow = slowOnApproach.startSlowDistance;
            
            if (distance > distanceToSlow) {
                return;
            }
            
            const speed = locomotion.maxSpeed;
            locomotion.speed = speed * (distance / distanceToSlow);
        });
    }
    
}
    
const agentsPerPoint = 4;

export class GameOverModule extends GameLogicModule {
    private game: GameLogic;
    public init(game: GameLogic): void {
        this.game = game;
        EventBus.on(GameEvents.GameOver, this.onGameOver, this);

        const slowOnApproachSystem = new SlowOnApproachSystem(game);
        game.ecs.addSystem(slowOnApproachSystem);
    }

    private onGameOver({victory}:{victory: boolean}) {
        EventBus.off(GameEvents.GameOver, this.onGameOver, this);

        const spawners = this.game.ecs.getEntitiesWithComponents([MobsSpawn]);
        spawners.forEach(spawner => {
            this.game.ecs.removeComponent(spawner, MobsSpawn);
        });
        
        const positions = victory ? winPositions : losePositions;
        
        for (const targetPosition of positions) {
            for (let i = 0; i < agentsPerPoint; i++) {
                this.createGameOverAgent(victory, targetPosition);
            }
        }
    }
    
    private createGameOverAgent(victory: boolean, targetPosition: {x: number, y: number}) {
        const game = this.game;
        
        const {x, y} = this.getRandomStartPosition();

        const entity = game.ecs.addEntity();

        game.ecs.addComponent(entity, new GameOverAgent(victory));

        const targetSelection = new AttackTarget(2);
        targetSelection.x = targetPosition.x * 32;
        targetSelection.y = targetPosition.y * 32;
        targetSelection.targetSize = 16;
        targetSelection.target = 1;
        game.ecs.addComponent(entity, targetSelection);

        game.ecs.addComponent(entity, new GlideLocomotion(1000));
        game.ecs.addComponent(entity, new Steering());
        game.ecs.addComponent(entity, new SlowOnApproach(300));

        game.addPhysicalComponents({entity, x, y, radius: 2, isGameOver: true});

        game.ecs.addComponent(entity, new GoapStateComponent({...defaultGoapState}));
        // game.ecs.addComponent(entity, new GoalsComponent([new GetToTargetGoal()]));
        // game.ecs.addComponent(entity, new AvailableActionsComponent([new MoveToTargetAction()]));
        game.ecs.addComponent(entity, new ActionComponent());
    }

    private getRandomStartPosition(): {x: number, y: number} {
        const mapSize = Configs.mapConfig.pixelsSize;

        // Center of the map
        const centerX = mapSize / 2;
        const centerY = mapSize / 2;

        // Radius of the circle, slightly larger than half of the map size
        const radius = 1000 + Math.random() * 1000;

        // Random angle in radians
        const angle = Phaser.Math.FloatBetween(0, 2 * Math.PI);

        // Calculate x and y coordinates on the circle
        const xStart = centerX + radius * Math.cos(angle);
        const yStart = centerY + radius * Math.sin(angle);

        return { x: xStart, y: yStart };
    }
}

const winPositions = [{"x":20,"y":18},{"x":21,"y":19},{"x":21,"y":20},{"x":22,"y":20},{"x":22,"y":21},{"x":23,"y":21},{"x":23,"y":22},{"x":26,"y":18},{"x":26,"y":19},{"x":25,"y":19},{"x":25,"y":20},{"x":24,"y":20},{"x":24,"y":21},{"x":23,"y":23},{"x":23,"y":24},{"x":23,"y":25},{"x":23,"y":26},{"x":23,"y":27},{"x":40,"y":20},{"x":39,"y":19},{"x":38,"y":19},{"x":38,"y":18},{"x":37,"y":18},{"x":36,"y":18},{"x":35,"y":18},{"x":34,"y":18},{"x":33,"y":18},{"x":33,"y":19},{"x":32,"y":19},{"x":32,"y":20},{"x":32,"y":21},{"x":31,"y":21},{"x":31,"y":22},{"x":31,"y":23},{"x":31,"y":24},{"x":31,"y":25},{"x":31,"y":26},{"x":32,"y":26},{"x":32,"y":27},{"x":33,"y":27},{"x":33,"y":28},{"x":34,"y":28},{"x":35,"y":28},{"x":35,"y":27},{"x":36,"y":27},{"x":37,"y":27},{"x":38,"y":27},{"x":38,"y":26},{"x":39,"y":26},{"x":40,"y":26},{"x":40,"y":25},{"x":40,"y":24},{"x":41,"y":23},{"x":41,"y":22},{"x":41,"y":21},{"x":41,"y":20},{"x":46,"y":18},{"x":45,"y":18},{"x":45,"y":19},{"x":45,"y":20},{"x":45,"y":21},{"x":45,"y":22},{"x":46,"y":23},{"x":46,"y":24},{"x":46,"y":25},{"x":47,"y":26},{"x":47,"y":27},{"x":48,"y":27},{"x":48,"y":28},{"x":49,"y":28},{"x":50,"y":28},{"x":50,"y":27},{"x":51,"y":27},{"x":51,"y":26},{"x":52,"y":26},{"x":52,"y":25},{"x":52,"y":24},{"x":52,"y":23},{"x":52,"y":22},{"x":52,"y":21},{"x":52,"y":20},{"x":52,"y":19},{"x":51,"y":19},{"x":19,"y":39},{"x":19,"y":40},{"x":19,"y":41},{"x":19,"y":42},{"x":20,"y":42},{"x":20,"y":43},{"x":20,"y":44},{"x":20,"y":45},{"x":20,"y":46},{"x":21,"y":46},{"x":21,"y":47},{"x":21,"y":45},{"x":22,"y":45},{"x":22,"y":44},{"x":23,"y":44},{"x":23,"y":43},{"x":24,"y":44},{"x":24,"y":45},{"x":24,"y":46},{"x":25,"y":46},{"x":25,"y":47},{"x":26,"y":46},{"x":26,"y":45},{"x":26,"y":44},{"x":26,"y":43},{"x":27,"y":42},{"x":27,"y":41},{"x":27,"y":40},{"x":27,"y":39},{"x":34,"y":39},{"x":34,"y":40},{"x":34,"y":41},{"x":34,"y":42},{"x":34,"y":43},{"x":34,"y":44},{"x":34,"y":45},{"x":33,"y":45},{"x":33,"y":46},{"x":33,"y":47},{"x":41,"y":39},{"x":41,"y":40},{"x":41,"y":41},{"x":41,"y":42},{"x":41,"y":43},{"x":41,"y":44},{"x":41,"y":45},{"x":41,"y":46},{"x":41,"y":47},{"x":42,"y":39},{"x":42,"y":40},{"x":43,"y":40},{"x":43,"y":41},{"x":44,"y":42},{"x":44,"y":43},{"x":45,"y":44},{"x":45,"y":45},{"x":45,"y":46},{"x":46,"y":39},{"x":46,"y":40},{"x":46,"y":41},{"x":46,"y":42},{"x":46,"y":43},{"x":46,"y":44},{"x":46,"y":45},{"x":46,"y":46},{"x":46,"y":47},{"x":34,"y":35},{"x":35,"y":35},{"x":33,"y":35},{"x":34,"y":36},{"x":34,"y":34},{"x":14,"y":29},{"x":13,"y":20},{"x":25,"y":11},{"x":40,"y":10},{"x":53,"y":14},{"x":57,"y":26},{"x":54,"y":37},{"x":56,"y":45},{"x":51,"y":52},{"x":42,"y":55},{"x":32,"y":55},{"x":21,"y":53},{"x":13,"y":46},{"x":10,"y":38}];
const losePositions = [{"x":19,"y":18},{"x":19,"y":19},{"x":20,"y":19},{"x":20,"y":20},{"x":21,"y":20},{"x":21,"y":21},{"x":22,"y":21},{"x":25,"y":18},{"x":25,"y":19},{"x":24,"y":19},{"x":24,"y":20},{"x":23,"y":20},{"x":23,"y":21},{"x":22,"y":22},{"x":22,"y":23},{"x":22,"y":24},{"x":22,"y":25},{"x":22,"y":26},{"x":36,"y":20},{"x":35,"y":20},{"x":34,"y":20},{"x":34,"y":19},{"x":33,"y":19},{"x":32,"y":19},{"x":31,"y":19},{"x":30,"y":19},{"x":30,"y":20},{"x":29,"y":20},{"x":29,"y":21},{"x":29,"y":22},{"x":29,"y":23},{"x":29,"y":24},{"x":30,"y":24},{"x":30,"y":25},{"x":31,"y":25},{"x":32,"y":25},{"x":33,"y":25},{"x":34,"y":25},{"x":34,"y":24},{"x":35,"y":24},{"x":35,"y":23},{"x":35,"y":22},{"x":36,"y":22},{"x":36,"y":21},{"x":40,"y":19},{"x":40,"y":20},{"x":40,"y":21},{"x":40,"y":22},{"x":40,"y":23},{"x":41,"y":24},{"x":41,"y":25},{"x":42,"y":25},{"x":43,"y":25},{"x":43,"y":24},{"x":44,"y":24},{"x":44,"y":23},{"x":45,"y":23},{"x":45,"y":22},{"x":45,"y":21},{"x":45,"y":20},{"x":45,"y":19},{"x":14,"y":36},{"x":14,"y":37},{"x":14,"y":38},{"x":14,"y":39},{"x":14,"y":40},{"x":14,"y":41},{"x":15,"y":41},{"x":16,"y":42},{"x":17,"y":42},{"x":26,"y":38},{"x":26,"y":37},{"x":25,"y":37},{"x":25,"y":36},{"x":24,"y":36},{"x":23,"y":36},{"x":22,"y":36},{"x":21,"y":36},{"x":21,"y":37},{"x":21,"y":38},{"x":20,"y":38},{"x":20,"y":39},{"x":21,"y":40},{"x":21,"y":41},{"x":22,"y":41},{"x":23,"y":41},{"x":24,"y":41},{"x":25,"y":41},{"x":26,"y":41},{"x":26,"y":40},{"x":27,"y":39},{"x":27,"y":38},{"x":36,"y":36},{"x":36,"y":35},{"x":35,"y":35},{"x":34,"y":35},{"x":33,"y":35},{"x":32,"y":35},{"x":32,"y":36},{"x":31,"y":36},{"x":31,"y":37},{"x":31,"y":38},{"x":32,"y":38},{"x":33,"y":38},{"x":33,"y":39},{"x":34,"y":39},{"x":35,"y":39},{"x":35,"y":38},{"x":36,"y":39},{"x":36,"y":40},{"x":36,"y":41},{"x":35,"y":41},{"x":35,"y":42},{"x":34,"y":42},{"x":33,"y":42},{"x":32,"y":42},{"x":31,"y":42},{"x":41,"y":36},{"x":41,"y":37},{"x":41,"y":38},{"x":41,"y":39},{"x":41,"y":40},{"x":40,"y":40},{"x":40,"y":41},{"x":40,"y":42},{"x":39,"y":42},{"x":41,"y":35},{"x":42,"y":35},{"x":43,"y":35},{"x":42,"y":39},{"x":43,"y":39},{"x":44,"y":39},{"x":41,"y":42},{"x":42,"y":42},{"x":43,"y":42},{"x":44,"y":35},{"x":45,"y":35},{"x":19,"y":42},{"x":18,"y":42},{"x":15,"y":42},{"x":35,"y":51},{"x":35,"y":50},{"x":34,"y":49},{"x":33,"y":48},{"x":22,"y":49},{"x":22,"y":50},{"x":21,"y":51},{"x":21,"y":52},{"x":21,"y":53},{"x":21,"y":54},{"x":21,"y":55},{"x":22,"y":56},{"x":23,"y":57},{"x":24,"y":58},{"x":25,"y":59},{"x":26,"y":59},{"x":26,"y":60},{"x":27,"y":60},{"x":28,"y":60},{"x":29,"y":60},{"x":30,"y":60},{"x":31,"y":60},{"x":32,"y":60},{"x":32,"y":59},{"x":33,"y":59},{"x":34,"y":58},{"x":35,"y":58},{"x":35,"y":57},{"x":36,"y":57},{"x":36,"y":56},{"x":36,"y":55},{"x":36,"y":54},{"x":36,"y":53},{"x":36,"y":52},{"x":36,"y":51},{"x":31,"y":56},{"x":31,"y":55},{"x":30,"y":55},{"x":29,"y":55},{"x":28,"y":55},{"x":27,"y":56},{"x":23,"y":48},{"x":24,"y":47},{"x":25,"y":46},{"x":26,"y":46},{"x":27,"y":46},{"x":28,"y":45},{"x":29,"y":45},{"x":30,"y":45},{"x":31,"y":46},{"x":32,"y":47},{"x":27,"y":55},{"x":32,"y":52},{"x":26,"y":52}];