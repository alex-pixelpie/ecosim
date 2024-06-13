import {GameLogic, GameLogicModule, GameSystem, PhysicalComponentCreationData} from "../GameLogic.ts";
import {Component} from "../../core/ECS.ts";
import {GameObjects} from "phaser";

export class Position extends Component {
    public constructor(public x: number, public y: number) {
        super();
    }
}

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
            const body = this.game.ecs.getComponent(entity, PhysicsBody);
            const pos = body.body.center;
            let position = this.game.ecs.getComponent(entity, Position);
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
    staticGroup: Phaser.Physics.Arcade.StaticGroup;
    gameOverGroup: Phaser.Physics.Arcade.Group;
    
    private game: GameLogic;

    public init(game:GameLogic): void {
        this.game = game;
        this.mobsGroup = game.scene.physics.add.group();
        this.gameOverGroup = game.scene.physics.add.group();
        this.staticGroup = game.scene.physics.add.staticGroup();
        
        game.scene.physics.add.collider(this.mobsGroup, this.mobsGroup);
        game.scene.physics.add.collider(this.mobsGroup, this.staticGroup);
        game.scene.physics.add.collider(this.gameOverGroup, this.gameOverGroup);
        
        this.game.addPhysicalComponents = this.addPhysicalComponents.bind(this);
        this.game.removePhysicalComponents = this.removePhysicalComponents.bind(this);
        
        const positionSynchronizationSystem = new PhysicsPositionSynchronizationSystem(game);
        game.ecs.addSystem(positionSynchronizationSystem);
        
        const size = game.config.tilesInMapSide * 32; // TODO - get value from config
        this.createCollidableBorders(size, size);
    }

    private addPhysicalComponents({isStatic, isGameOver, y, radius, entity, x, width, height}: PhysicalComponentCreationData) {
        const group = isStatic ? this.staticGroup : isGameOver? this.gameOverGroup : this.mobsGroup; // Double ternary operator :scream:
        const bodyContainer = group.create(x, y) as GameObjects.Container;
        bodyContainer.setVisible(false);
        const body = bodyContainer.body as Phaser.Physics.Arcade.Body;
        
        if (width && height) {
            body.setSize(width, height);
        } else if (radius) {
            body.setCircle(radius, 0, 0);
        }
        
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
        const bordersGroup = this.staticGroup;
        const offset = 50;
        
        bordersGroup.create(worldWidth / 2, offset).setSize(worldWidth, 1);
        bordersGroup.create(worldWidth / 2, worldHeight - offset).setSize(worldWidth, 1);
        bordersGroup.create(offset, worldHeight / 2).setSize(1, worldHeight);
        bordersGroup.create(worldWidth - offset, worldHeight / 2).setSize(1, worldHeight);
        bordersGroup.setVisible(false);
    }
}