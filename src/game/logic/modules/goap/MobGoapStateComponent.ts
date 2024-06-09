import {Component} from "../../../core/ECS.ts";

export class MobGoapStateComponent implements Component {
    state: Record<string, boolean>;

    constructor(state: Record<string, boolean>) {
        this.state = state;
    }
}