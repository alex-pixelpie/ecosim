import {MapConfig} from "./MapConfig.ts";
import {MobsConfig} from "./MobsConfig.ts";
import {BuildingsConfig} from "./BuildingsConfig.ts";

export class Configs {
    public static readonly mapConfig = new MapConfig();
    public static readonly mobsConfig = new MobsConfig();
    public static readonly buildingsConfig = new BuildingsConfig();
}