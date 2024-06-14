import {Component} from "../../../core/ECS.ts";

// TODO - deprecate all usages
// TODO - refactor GOAP to use state consts
export enum GoapState {
    hasTarget = "hasTarget",
    inRangeOfTarget = "inRangeOfTarget",
    overwhelmed = "overwhelmed",
    closeToHome = "closeToHome",
    homePatrolled = "homePatrolled",
    targetsInSight = "targetsInSight",
}

export const GoapMobilityState = {
    idle : "idle",
    moving : "moving",
    attacking : "attacking",
    fleeing : "fleeing",
} as const;

export const GoapHealthState = {
    healthy : "healthy",
    injured : "injured",
    critical : "critical",
} as const;

export const GoapCombatState = {
    ready : "ready",
    hasTarget : "hasTarget",
    targetInRange : "targetInRange",
    overwhelmed : "overwhelmed",
    attacking : "attacking",
} as const;

export const GoapPatrolState = {
    patrolling: "patrolling",
    closeToHome : "closeToHome",
    homePatrolled : "homePatrolled",
} as const;

export const GoapStateConst = {...GoapMobilityState, ...GoapHealthState, ...GoapCombatState, ...GoapPatrolState} as const;

export type GoapStateKey = keyof typeof GoapStateConst;

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