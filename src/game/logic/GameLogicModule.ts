import { GameLogic } from "./GameLogic.ts";


export abstract class GameLogicModule {
    public abstract init(game: GameLogic): void;
    public destroy(): void {}
    
    public update(delta:number): void {}
}
