import {ECS} from "../../core/ECS.ts";
import {MapDisplay} from "./../MapDisplay.ts";
import {FrameLog, FrameLogType} from "../../logic/modules/FrameLogModule.ts";
import {Mob} from "../../logic/modules/MobsModule.ts";
import {Corpse, Health, Ruin} from "../../logic/modules/DeathModule.ts";
import {Building} from "../../logic/modules/BuildingsModule.ts";
import {GameOverAgent} from "../../logic/modules/GameOverModule.ts";
import {PhysicsBody, Position} from "../../logic/modules/PhaserPhysicsModule.ts";
import {TargetGroup, TargetOfAttack} from "../../logic/modules/TargetingModule.ts";
import {DisplayModule} from "../DisplayModule.ts";
import {Tile} from "../../logic/modules/TilesModule.ts";
import {Configs} from "../../configs/Configs.ts";
import {Senses} from "../../logic/modules/SensoryModule.ts";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin";
import {EventBus, GameEvents, UiEvents} from "../../EventBus.ts";
import {ActionComponent, GoalsComponent} from "../../logic/modules/goap/GoapModule.ts";

export type AutoRpgDisplayModule = DisplayModule<AutoRpgDisplay>;

export class TileDisplayData {
    public position: {x: number, y: number};
}

export enum DisplayEntityType {
    Mob = 'mob',
    Corpse = 'corpse',
    Building = 'building',
    Ruin = 'ruin',
    GameOverAgent = 'gameOverAgent'
}

export type DisplayEntityData = {
    id: number;
    x: number;
    y: number;
    subtype: string;
    type: DisplayEntityType;
}

export type SelectableData ={
    isSelected?:boolean;
}

export type SelectableDisplayEntityData = DisplayEntityData & SelectableData;

export type DamageSustainedData = {
    damage?: number;
    criticalMultiplier?: number;
}

export type HealthData = {
    health: number | string;
    maxHealth?: number;
}

export type CorpseData = {
    rotFactor: number;
} & DisplayEntityData & DamageSustainedData & SelectableData;

export type GameOverAgentData = DisplayEntityData & SelectableData;

export type MobData = {
    state: {
        attacking: boolean;
        direction: number;
        moving: boolean;
        damage?: number;
        criticalMultiplier?: number;
    },
    group:number;
    rotationToTarget: number;
    sensoryRange?: number;
    targetsInRange?: number;
    minAttackRange?: number;
    maxAttackRange?: number;
    goal:string;
    action:string;
} & DisplayEntityData & DamageSustainedData & SelectableData & HealthData;

export type BuildingData = {
    group:number;
} & DisplayEntityData & DamageSustainedData & SelectableData & HealthData;

export class AutoRpgDisplay {
    mapDisplay: MapDisplay;
    modules: AutoRpgDisplayModule[];
    scene: Phaser.Scene;
    ecs: ECS;
    tiles: TileDisplayData[][];
    mobs: MobData[] = [];
    corpses: CorpseData[] = [];
    buildings: BuildingData[] = [];
    ruins: SelectableDisplayEntityData[] = [];
    gameOverAgents:GameOverAgentData[] = [];
    
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
    
    outlinePlugin:OutlinePipelinePlugin;
    
    selectedEntity:number;
    
    constructor(scene: Phaser.Scene, ecs:ECS, modules: AutoRpgDisplayModule[]) {
        const mapConfig = Configs.mapConfig;
        
        this.ecs = ecs;
        this.scene = scene;
        this.modules = modules;
        this.mapDisplay = new MapDisplay(scene, mapConfig.tilesInMapSide);

        this.tiles = Array.from({length: mapConfig.tilesInMapSide}, () => Array.from({length: mapConfig.tilesInMapSide}, () => new TileDisplayData()));
        modules.forEach(module => module.init(this));

        this.corpsesLayer = scene.add.container();
        this.groundShadow = scene.add.container();
        this.groundUi = scene.add.container();
        this.mobsLayer = scene.add.container();
        this.mobUi = scene.add.container();
        this.overlayUi = scene.add.container();
        this.airShadow = scene.add.container();
        this.air = scene.add.container();

        this.outlinePlugin  = scene.plugins.get('rexOutlinePipeline') as OutlinePipelinePlugin;
        
        EventBus.on(GameEvents.EntityTap, (entityId: number) => {
            if (this.selectedEntity == entityId){
                this.selectedEntity = -1;
            } else {
                this.selectedEntity = entityId;
            }
        });
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

        const selected = [...this.mobs,
            ...this.corpses,
            ...this.buildings,
            ...this.ruins,
            ...this.gameOverAgents].find(entity => entity.id == this.selectedEntity);

        EventBus.emit(UiEvents.EntitySelected, {selected});
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
                subtype: 'bat-0',
                type: DisplayEntityType.GameOverAgent,
            } as GameOverAgentData;
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
            const targeting = this.ecs.getComponent(entity, TargetOfAttack);
            const health = this.ecs.getComponent(entity, Health);
            const log = this.ecs.getComponent(entity, FrameLog);
            const group = this.ecs.getComponent(entity, TargetGroup);
            const senses = this.ecs.getComponent(entity, Senses);
            
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
            
            const action = this.ecs.getComponent(entity, ActionComponent);
            const goal = this.ecs.getComponent(entity, GoalsComponent);
            
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
                subtype: mob?.type || 'skeleton',
                x: body?.x || 0,
                y: body?.y || 0,
                group: group?.id || 0,
                rotationToTarget,
                sensoryRange: senses?.range || 0,
                targetsInRange: senses?.entitiesInRange.length,
                minAttackRange: targeting?.minAttackRange || 0,
                maxAttackRange: targeting?.maxAttackRange || 0,
                isSelected: this.selectedEntity == entity,
                type: DisplayEntityType.Mob,
                goal: goal?.goal.name || 'N/A',
                action: action?.currentAction?.name || 'N/A'
            } as MobData;
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
                subtype: corpse?.type || 'skeleton',
                damage,
                criticalMultiplier,
                rotFactor,
                isSelected: this.selectedEntity == entity,
                type: DisplayEntityType.Corpse
            } as CorpseData;
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
                subtype: building?.type || 'castle',
                health: health?.value || 'N/A',
                maxHealth: health?.maxValue,
                group: group?.id || 0,
                damage,
                criticalMultiplier,
                isSelected: this.selectedEntity == entity,
                type: DisplayEntityType.Building
            } as BuildingData;
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
                subtype: ruin?.type || 'castle',
                isSelected: this.selectedEntity == entity,
                type: DisplayEntityType.Ruin
            } as SelectableDisplayEntityData;
        });
        
        this.ruins = ruins;
    }
}
