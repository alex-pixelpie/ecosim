import {GameLogic} from "../GameLogic.ts";
import {GameLogicModule} from "../GameLogicModule.ts";
import {EventBus, GameEvents} from "../../EventBus.ts";
import {Pos} from "../../utils/Math.ts";
import {GroupLoot} from "./SensoryModule.ts";
import {GroupType} from "./MobsModule.ts";

export class PlayerInteractionModule extends GameLogicModule {
    private game: GameLogic;
    public init(game: GameLogic): void {
        this.game = game;
        EventBus.on(GameEvents.RightClick, this.handleRightClick.bind(this));
    }

    private handleRightClick(pos:Pos) {
        GroupLoot.getGroupLootByGroup(this.game.ecs, GroupType.Green).dropCoinsAt(this.game, pos);
    }
}