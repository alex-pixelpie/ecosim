import {GameLogic, GameLogicModule, GameSystem} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";
import {PhysicsModule} from "./PhysicsModule.ts";
import {GameObjects} from "phaser";

export namespace PhaserPhysicsModule {
    import Position = PhysicsModule.Position;

    export class PhysicsBody extends Component {
        public constructor(public body: Phaser.Physics.Arcade.Body, public container: GameObjects.Container) {
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
        borderGroup: Phaser.Physics.Arcade.StaticGroup;

        private game: GameLogic;

        public init(game:GameLogic): void {
            this.game = game;
            this.mobsGroup = game.scene.physics.add.group();
            this.borderGroup = game.scene.physics.add.staticGroup();

            game.scene.physics.add.collider(this.mobsGroup, this.mobsGroup);
            game.scene.physics.add.collider(this.mobsGroup, this.borderGroup);
            
            this.game.addPhysicalComponents = this.addPhysicalComponents.bind(this);
            this.game.removePhysicalComponents = this.removePhysicalComponents.bind(this);
            
            const positionSynchronizationSystem = new PhysicsPositionSynchronizationSystem(game);
            game.ecs.addSystem(positionSynchronizationSystem);
            
            const size = game.config.tilesInMapSide * 32; // TODO - get value from config
            this.createCollidableBorders(size, size);
        }

        private addPhysicalComponents(entity: number, x: number, y: number, radius: number = 16) {
            const bodyContainer = this.mobsGroup.create(x, y) as GameObjects.Container;
            bodyContainer.setVisible(false);
            const body = bodyContainer.body as Phaser.Physics.Arcade.Body;
            body.setCircle(radius, 0, 0);
            
            this.game.ecs.addComponent(entity, new PhysicsBody(body, bodyContainer));
        }

        private removePhysicalComponents(entity: number) {
            const body = this.game.ecs.getComponent<PhysicsBody>(entity, PhysicsBody);
            
            if (body) {
                body.container.destroy();
                body.body.destroy();
            }
        }

        private createCollidableBorders(worldWidth:number, worldHeight:number) {
            const bordersGroup = this.borderGroup;
            
            bordersGroup.create(worldWidth / 2, 0).setSize(worldWidth, 1);
            bordersGroup.create(worldWidth / 2, worldHeight).setSize(worldWidth, 1);
            bordersGroup.create(0, worldHeight / 2).setSize(1, worldHeight);
            bordersGroup.create(worldWidth, worldHeight / 2).setSize(1, worldHeight);
            // bordersGroup.setVisible(false);
        }
    }
}