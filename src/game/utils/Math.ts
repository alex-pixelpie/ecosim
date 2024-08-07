export interface Pos {x:number; y:number}

export class MathUtils {
    static weightedRand(weightedValues: { [key: number]: number }): number {
        // Calculate the total weight
        let totalWeight = 0;
        for (let key in weightedValues) {
            totalWeight += weightedValues[key];
        }

        // Generate a random number in the range [0, totalWeight)
        let random = Math.random() * totalWeight;

        // Determine which key corresponds to the random number
        for (let key in weightedValues) {
            random -= weightedValues[key];
            if (random <= 0) {
                return parseInt(key);
            }
        }

        // Fallback, should theoretically never be reached
        return -1;
    }

    static remapNoiseToUnit(value: number): number {
        return (value + 1) / 2;
    }
    
    static distance(pos1: Pos, pos2: Pos): number {
        // Simple Euclidean distance calculation
        return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
    }
    
    static normalize(pos: Pos): Pos {
        const length = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
        if (length == 0) return { x: 0, y: 0 };
        return { x: pos.x / length, y: pos.y / length };
    }
    
    static multiply(pos: Pos, scalar: number): Pos {
        return { x: pos.x * scalar, y: pos.y * scalar };
    }
    
    static add(pos1: Pos, pos2: Pos): Pos {
        return { x: pos1.x + pos2.x, y: pos1.y + pos2.y };
    }
    
    static subtract(pos1: Pos, pos2: Pos): Pos {
        return { x: pos1.x - pos2.x, y: pos1.y - pos2.y };
    }

    static randomPointOnCircumference(position: Pos, radius: number): Pos {
        const angle = Math.random() * 2 * Math.PI;
        const x = position.x + radius * Math.cos(angle);
        const y = position.y + radius * Math.sin(angle);
        return { x, y };
    }
    
    static closestValue(position: Pos, values: Set<number>, positions: Map<number, Pos>): number | undefined {
        let closest = Number.MAX_VALUE;
        let target = undefined;
        
        values.forEach(value => {
            const pos = positions.get(value);
            if (!pos) {
                return;
            }
            const distance = MathUtils.distance(position, pos);
            if (distance < closest) {
                closest = distance;
                target = value;
            }
        });
        
        return target;
    }
}