import {Component} from "../../../core/ECS.ts";

export enum GoapState {
    hasTarget = "hasTarget",
    inRangeOfTarget = "inRangeOfTarget",
    overwhelmed = "overwhelmed",
    closeToHome = "closeToHome"
}

export class GoapStateComponent implements Component {
    state: Record<GoapState, boolean>;

    constructor(state: Record<GoapState, boolean>) {
        this.state = state;
    }
}

export const defaultState: Record<GoapState, boolean> = { 
    [GoapState.hasTarget]: false, 
    [GoapState.inRangeOfTarget]: false, 
    [GoapState.overwhelmed]: false,
    [GoapState.closeToHome]: false
};
