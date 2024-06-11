import {ECS} from "../../core/ECS.ts";
import {TilesModule} from "../../logic/modules/TilesModule.ts";
import {MapDisplay} from "./../MapDisplay.ts";
import Tile = TilesModule.Tile;
import {PhysicsModule} from "../../logic/modules/PhysicsModule.ts";
import Position = PhysicsModule.Position;
import {DisplayModule} from "../DisplayModule.ts";
import {MobsModule} from "../../logic/modules/MobsModule.ts";
import Mob = MobsModule.Mob;
import {PhaserPhysicsModule} from "../../logic/modules/PhaserPhysicsModule.ts";
import {Health} from "../../logic/modules/weapons/Attack.ts";
import {TargetSelection} from "../../logic/modules/Targeting.ts";
import {FrameLog} from "../../logic/modules/FrameLog.ts";

const MAP_SIZE = 64;
const WHITE_TILE : number = 8;

export type AutoRpgDisplayModule = DisplayModule<AutoRpgDisplay>;

export class TileDisplayData {
    public position: {x: number, y: number};
}


export type MobData = {
    id: number;
    state: {
        attacking: boolean;
        direction: number;
        moving: boolean;
        damage?: number;
        criticalMultiplier?: number;
    },
    health: number | string;
    maxHealth?: number;
    type: string;
    x: number;
    y: number;
}


export class AutoRpgDisplayConfig {
    whiteTile: number = WHITE_TILE;
}

export class AutoRpgDisplay {
    mapDisplay: MapDisplay;
    modules: AutoRpgDisplayModule[];
    scene: Phaser.Scene;
    ecs: ECS;
    tiles: TileDisplayData[][];
    mobs: MobData[] = [];
    config:AutoRpgDisplayConfig  = new AutoRpgDisplayConfig();
    
    // Layers
    mobUi: Phaser.GameObjects.Container;
    overlayUi: Phaser.GameObjects.Container;
    mobsLayer: Phaser.GameObjects.Container;
    timeFromStart: number = 0;
    
    constructor(scene: Phaser.Scene, ecs:ECS, modules: AutoRpgDisplayModule[]) {
        this.ecs = ecs;
        this.scene = scene;
        this.modules = modules;
        this.mapDisplay = new MapDisplay(scene, MAP_SIZE);

        this.tiles = Array.from({length: MAP_SIZE}, () => Array.from({length: MAP_SIZE}, () => new TileDisplayData()));
        modules.forEach(module => module.init(this));

        this.mobsLayer = scene.add.container();
        this.mobUi = scene.add.container();
        this.overlayUi = scene.add.container();
    }
 
    update(delta: number) {
        this.timeFromStart += delta;
        this.updateTiles();
        this.updateMobs();
        this.modules.forEach(module => module.update(delta));
    }
    
    private updateTiles(){
        const entities = this.ecs.getEntitiesWithComponent(Tile);
        
        entities.forEach(entity => {
            const position = this.ecs.getComponent(entity, Position);
            
            this.tiles[position.x][position.y] = {
                position: {x: position.x, y: position.y}
            };
        });
    }

    private updateMobs() {
        const entities = this.ecs.getEntitiesWithComponent(Mob);
        
        const mobs = entities.map(entity => {
            const body = this.ecs.getComponent(entity, PhaserPhysicsModule.PhysicsBody)?.body;
            const mob = this.ecs.getComponent(entity, Mob);
            const targeting = this.ecs.getComponent(entity, TargetSelection);
            const health = this.ecs.getComponent(entity, Health);
            const log = this.ecs.getComponent(entity, FrameLog.FrameLog);
            
            let direction = 1;
            
            const target = targeting?.target;
            const hasTarget = target != null;
            
            if (hasTarget) {
                const targetPosition = this.ecs.getComponent(target, Position);
                const mobPosition = this.ecs.getComponent(entity, Position);
                const dx = (targetPosition?.x || 0) - (mobPosition?.x || 0);
                direction = dx > 0 ? 1 : -1;
            }
            
            const attacking = log?.logs.some(log => log.type === FrameLog.FrameLogType.Attack);
            const damage = log?.logs.reduce((acc, log) => log.type === FrameLog.FrameLogType.TakeDamage ? acc + log.value : acc, 0);
            const criticalMultiplier = log?.logs.reduce((acc, log) => log.type === FrameLog.FrameLogType.TakeCriticalDamage ? log.value : acc, 0);
            
            return {
                id: entity,
                state: {
                    direction,
                    moving: body?.velocity.x !== 0 || body?.velocity.y !== 0,
                    attacking,
                    damage,
                    criticalMultiplier
                },
                health: health?.value || 'N/A',
                maxHealth: health?.maxValue,
                type: mob?.type || 'skeleton',
                x: body?.x || 0,
                y: body?.y || 0
            };
        });

        this.mobs = mobs;
    }
}
