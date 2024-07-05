import {MapConfig} from "./MapConfig.ts";
import {MobsConfig} from "./MobsConfig.ts";
import {BuildingsConfig} from "./BuildingsConfig.ts";
import {SessionConfig} from "./SessionConfig.ts";

export class Configs {
    public static readonly sessionConfig = new SessionConfig();
    public static readonly mapConfig = new MapConfig();
    public static readonly mobsConfig = new MobsConfig();
    public static readonly buildingsConfig = new BuildingsConfig();
}