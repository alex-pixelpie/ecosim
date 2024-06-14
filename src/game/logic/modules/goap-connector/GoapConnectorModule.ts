import {GameLogic} from "../../GameLogic.ts";
import { GameLogicModule } from "../../GameLogicModule.ts";
import { GoapStateUpdateSystem } from "./systems/GoapStateUpdateSystem.ts";
import { GoapToWeaponUseSystem } from "./systems/GoapToWeaponUseSystem.ts";
import {GoapToSteeringImpulsesSystem} from "./systems/GoapToSteeringImpulsesSystem.ts";

export class GoapConnectorModule extends GameLogicModule {
    public init(game: GameLogic): void {
        const goapToSteeringDesiresSystem = new GoapToSteeringImpulsesSystem(game);
        game.ecs.addSystem(goapToSteeringDesiresSystem);
        
        const weaponUseSystem = new GoapToWeaponUseSystem(game);
        game.ecs.addSystem(weaponUseSystem);
        
        const goapStateUpdateSystem = new GoapStateUpdateSystem(game);
        game.ecs.addSystem(goapStateUpdateSystem);
    }
}