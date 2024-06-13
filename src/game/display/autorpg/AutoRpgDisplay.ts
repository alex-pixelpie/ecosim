import {ECS} from "../../core/ECS.ts";
import {MapDisplay} from "./../MapDisplay.ts";
import {FrameLog, FrameLogType} from "../../logic/modules/FrameLog.ts";
import {Mob} from "../../logic/modules/MobsModule.ts";
import {Corpse, Health, Ruin} from "../../logic/modules/DeathModule.ts";
import {Building} from "../../logic/modules/BuildingsModule.ts";
import {GameOverAgent} from "../../logic/modules/GameOverModule.ts";
import {PhaserPhysicsModule, PhysicsBody, Position} from "../../logic/modules/PhaserPhysicsModule.ts";
import {TargetGroup, TargetSelection} from "../../logic/modules/TargetingModule.ts";
import {DisplayModule} from "../DisplayModule.ts";
import {Tile} from "../../logic/modules/TilesModule.ts";

const MAP_SIZE = 64;
const WHITE_TILE : number = 8;

export type AutoRpgDisplayModule = DisplayModule<AutoRpgDisplay>;

export class TileDisplayData {
    public position: {x: number, y: number};
}

export type CorpseData = {
    rotFactor: number;
    id: number;
    x: number;
    y: number;
    type: string;
    damage?: number;
    criticalMultiplier?: number;
}

export type RuinData = {
    id: number;
    x: number;
    y: number;
    type: string;
}

export type GameOverAgentData = {
    id: number;
    x: number;
    y: number;
    type: string;
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
    group:number;
    rotationToTarget: number;
}

export type BuildingData = {
    id: number;
    x: number;
    y: number;
    type: string;
    group:number;
    health: number | string;
    maxHealth?: number;
    damage?: number;
    criticalMultiplier?: number;
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
    corpses: CorpseData[] = [];
    buildings: BuildingData[] = [];
    ruins: RuinData[] = [];
    gameOverAgents:GameOverAgentData[] = [];
    
    config:AutoRpgDisplayConfig  = new AutoRpgDisplayConfig();
    
    // Layers
    mobUi: Phaser.GameObjects.Container;
    overlayUi: Phaser.GameObjects.Container;
    mobsLayer: Phaser.GameObjects.Container;
    corpsesLayer: Phaser.GameObjects.Container;
    groundUi: Phaser.GameObjects.Container;
    groundShadow: Phaser.GameObjects.Container;
    airShadow: Phaser.GameObjects.Container;
    air: Phaser.GameObjects.Container;
    timeFromStart: number = 0;
    
    constructor(scene: Phaser.Scene, ecs:ECS, modules: AutoRpgDisplayModule[]) {
        this.ecs = ecs;
        this.scene = scene;
        this.modules = modules;
        this.mapDisplay = new MapDisplay(scene, MAP_SIZE);

        this.tiles = Array.from({length: MAP_SIZE}, () => Array.from({length: MAP_SIZE}, () => new TileDisplayData()));
        modules.forEach(module => module.init(this));

        this.corpsesLayer = scene.add.container();
        this.groundShadow = scene.add.container();
        this.groundUi = scene.add.container();
        this.mobsLayer = scene.add.container();
        this.mobUi = scene.add.container();
        this.overlayUi = scene.add.container();
        this.airShadow = scene.add.container();
        this.air = scene.add.container();
    }
 
    update(delta: number) {
        this.timeFromStart += delta;
        this.updateTiles();
        this.updateMobs();
        this.updateCorpses();
        this.updateBuildings();
        this.updateRuins();
        this.updateGameOverAgents();
        
        this.modules.forEach(module => module.update(delta));

        this.mobsLayer.sort('y');

    }
    
    private updateGameOverAgents() {
        const entities = this.ecs.getEntitiesWithComponent(GameOverAgent);
        
        const gameOverAgents = entities.map(entity => {
            const position = this.ecs.getComponent(entity, Position);
            // const gameOverAgent = this.ecs.getComponent(entity, GameOverAgent);
            
            return {
                id: entity,
                x: position?.x || 0,
                y: position?.y || 0,
                type: 'bat-0'
            };
        });
        
        this.gameOverAgents = gameOverAgents;
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
            const body = this.ecs.getComponent(entity, PhysicsBody)?.body;
            const mob = this.ecs.getComponent(entity, Mob);
            const targeting = this.ecs.getComponent(entity, TargetSelection);
            const health = this.ecs.getComponent(entity, Health);
            const log = this.ecs.getComponent(entity, FrameLog);
            const group = this.ecs.getComponent(entity, TargetGroup);
            
            let direction = 1;
            
            const target = targeting?.target;
            const hasTarget = target != null;
            let rotationToTarget = 0;
            
            if (hasTarget) {
                const targetPosition = this.ecs.getComponent(target, Position);
                const mobPosition = this.ecs.getComponent(entity, Position);
                const dx = (targetPosition?.x || 0) - (mobPosition?.x || 0);
                direction = dx > 0 ? 1 : -1;
                rotationToTarget = Math.atan2((targetPosition?.y || 0) - (mobPosition?.y || 0), dx);
            }
            
            const attacking = log?.logs.some(log => log.type === FrameLogType.Attack);
            const damage = log?.logs.reduce((acc, log) => log.type === FrameLogType.TakeDamage ? acc + log.value : acc, 0);
            const criticalMultiplier = log?.logs.reduce((acc, log) => log.type === FrameLogType.TakeCriticalDamage ? log.value : acc, 0);
            
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
                y: body?.y || 0,
                group: group?.id || 0,
                rotationToTarget
            };
        });

        this.mobs = mobs;
    }

    private updateCorpses() {
        const entities = this.ecs.getEntitiesWithComponent(Corpse);
        
        const corpses = entities.map(entity => {
            const corpse = this.ecs.getComponent(entity, Corpse);
            const log = this.ecs.getComponent(entity, FrameLog);
            
            const damage = log?.logs.reduce((acc, log) => log.type === FrameLogType.TakeDamage ? acc + log.value : acc, 0);
            const criticalMultiplier = log?.logs.reduce((acc, log) => log.type === FrameLogType.TakeCriticalDamage ? log.value : acc, 0);
            
            const currentAge = corpse.age;
            const maxAge = corpse.maxAge;
            const rotFactor = 1 - (currentAge / maxAge); 
            
            return {
                id: entity,
                x: corpse?.x || 0,
                y: corpse?.y || 0,
                type: corpse?.type || 'skeleton',
                damage,
                criticalMultiplier,
                rotFactor
            };
        });
        
        this.corpses = corpses;
    }

    private updateBuildings() {
        const entities = this.ecs.getEntitiesWithComponent(Building);
        
        const buildings = entities.map(entity => {
            const position = this.ecs.getComponent(entity, Position);
            const building = this.ecs.getComponent(entity, Building);
            const health = this.ecs.getComponent(entity, Health);
            const group = this.ecs.getComponent(entity, TargetGroup);
            const log = this.ecs.getComponent(entity, FrameLog);

            const damage = log?.logs.reduce((acc, log) => log.type === FrameLogType.TakeDamage ? acc + log.value : acc, 0);
            const criticalMultiplier = log?.logs.reduce((acc, log) => log.type === FrameLogType.TakeCriticalDamage ? log.value : acc, 0);
            
            return {
                id: entity,
                x: position?.x || 0,
                y: position?.y || 0,
                type: building?.type || 'castle',
                health: health?.value || 'N/A',
                maxHealth: health?.maxValue,
                group: group?.id || 0,
                damage,
                criticalMultiplier
            };
        });

        this.buildings = buildings;
    }

    private updateRuins() {
        const entities = this.ecs.getEntitiesWithComponent(Ruin);
        
        const ruins = entities.map(entity => {
            const ruin = this.ecs.getComponent(entity, Ruin);
            
            return {
                id: entity,
                x: ruin?.x || 0,
                y: ruin?.y || 0,
                type: ruin?.type || 'castle'
            };
        });
        
        this.ruins = ruins;
    }
}
