import {Component} from "../../../core/ECS.ts";

export const GoapMobilityState = {
    isAtMoveTarget : "isAtMoveTarget",
    hasMoveTarget: "hasMoveTarget"
} as const;

export const GoapPatrolState = {
    patrolling: "patrolling",
    isPatrolOnCooldown: "isPatrolOnCooldown"
} as const;

export const GoapStateConst = {...GoapMobilityState, ...GoapPatrolState} as const;

export type GoapStateKey = keyof typeof GoapStateConst;

export type GoapState = Record<GoapStateKey, boolean>;

export const defaultGoapState: Record<GoapStateKey, boolean> = Object.keys(GoapStateConst).reduce((acc, key) => {
    acc[key as GoapStateKey] = false;
    return acc;
}, {} as Record<GoapStateKey, boolean>);

export class GoapStateComponent implements Component {
    state: Record<GoapStateKey, boolean>;

    constructor(state: Record<GoapStateKey, boolean>) {
        this.state = state;
    }
}