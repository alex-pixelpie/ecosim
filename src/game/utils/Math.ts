interface Pos {x:number; y:number}

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
}