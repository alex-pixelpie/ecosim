import { GameLogic } from "../../GameLogic.ts";
import {FrameLog, FrameLogType} from "../FrameLogModule.ts";
import { Health } from "../DeathModule.ts";
import { WeaponEffectFunction, Weapon } from "./Weapons.ts";
import {TargetSelection} from "../TargetingModule.ts";

export const WeaponEffectDirectDamage: WeaponEffectFunction = (game: GameLogic, owner: number, weapon: Weapon): void => {
    const targetSelection = game.ecs.getComponent(owner, TargetSelection);
    const target = targetSelection?.target as number;

    // Check if the target is a valid entity
    if (isNaN(target)) {
        return;
    }

    const health = game.ecs.getComponent(target, Health);
    if (!health) {
        return;
    }

    const damage = weapon.damage;
    const crit = weapon.criticalDamage;
    const totalDamage = damage * crit;
    health.value -= totalDamage;
    weapon.appliedEffectThisAttack = true;

    const targetLog = game.ecs.getComponent(target, FrameLog);
    targetLog?.logs.push({ type: FrameLogType.TakeDamage, value: totalDamage, timestamp: game.currentTime });
    crit > 1 && targetLog?.logs.push({ type: FrameLogType.TakeCriticalDamage, value: crit, timestamp: game.currentTime });
};
