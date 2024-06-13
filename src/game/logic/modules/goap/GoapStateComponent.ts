import {Component} from "../../../core/ECS.ts";

export enum GoapState {
    hasTarget = "hasTarget",
    inRange = "inRange",
    overwhelmed = "overwhelmed"
}

export class GoapStateComponent implements Component {
    state: Record<GoapState, boolean>;

    constructor(state: Record<GoapState, boolean>) {
        this.state = state;
    }
}