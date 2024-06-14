import { GameSystem } from "../../../GameLogic.ts";
import { Weapon } from "../../weapons/Weapons.ts";
import { AttackAction } from "../../goap/actions/AttackAction.ts";
import { ActionComponent } from "../../goap/GoapModule.ts";

export class GoapToWeaponUseSystem extends GameSystem {
    public intensity: number = 1;

    public componentsRequired: Set<Function> = new Set([ActionComponent, Weapon]);

    protected init(): void {
        this.componentsRequired = new Set([ActionComponent, Weapon]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const weapon = this.game.ecs.getComponent<Weapon>(entity, Weapon);
            const action = this.game.ecs.getComponent(entity, ActionComponent);
            weapon.isInUse = action?.currentAction?.type == AttackAction.name;
        });
    }
}
