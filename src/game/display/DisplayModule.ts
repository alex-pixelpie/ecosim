export abstract class DisplayModule<T> {
    public abstract init(display: T): void;
    public abstract update(delta: number): void;
}
