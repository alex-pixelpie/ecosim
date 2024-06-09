import {GameLogic, GameLogicModule, GameSystem} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";
import {PhysicsModule} from "./PhysicsModule.ts";

export namespace PhaserPhysicsModule {
    import Position = PhysicsModule.Position;

    export class PhysicsBody extends Component {
        public constructor(public body: Phaser.Physics.Arcade.Body) {
            super();
        }
    }
    
    class PhysicsPositionSynchronizationSystem extends GameSystem {
        public componentsRequired: Set<Function> = new Set([PhysicsBody]);
        
        protected init(): void {
            this.componentsRequired = new Set([PhysicsBody]);
        }
        
        public update(entities: Set<number>, _: number): void {
            entities.forEach(entity => {
                const body = this.game.ecs.getComponent<PhysicsBody>(entity, PhysicsBody);
                const pos = body.body.position;
                let position = this.game.ecs.getComponent<Position>(entity, Position);
                if (!position) {
                    position = new Position(pos.x, pos.y);
                    this.game.ecs.addComponent(entity, position);
                }
                position.x = pos.x;
                position.y = pos.y;
            });
        }
    }
        
        
    export class PhaserPhysicsModule extends GameLogicModule {
        mobsGroup: Phaser.Physics.Arcade.Group;
        private game: GameLogic;
        
        public init(game:GameLogic): void {
            this.game = game;
            this.mobsGroup = game.scene.physics.add.group();
            game.scene.physics.add.collider(this.mobsGroup, this.mobsGroup);
            this.game.addPhysicalComponents = this.addPhysicalComponents.bind(this);
            this.game.removePhysicalComponents = this.removePhysicalComponents.bind(this);
            
            const positionSynchronizationSystem = new PhysicsPositionSynchronizationSystem(game);
            game.ecs.addSystem(positionSynchronizationSystem);
        }

        private addPhysicalComponents(entity: number, x: number, y: number, radius: number = 16) {
            let body = this.mobsGroup.create(x, y).body as Phaser.Physics.Arcade.Body;
            body.setCircle(radius, 0, 0);
            this.game.ecs.addComponent(entity, new PhysicsBody(body));
        }

        private removePhysicalComponents(entity: number) {
            const body = this.game.ecs.getComponent<PhysicsBody>(entity, PhysicsBody);
            if (body) {
                body.body.destroy();
            }
        }
    }
}