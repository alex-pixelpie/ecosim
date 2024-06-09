import React, { useEffect, useState } from 'react';
import {EventBus, UiEvents} from "../EventBus.ts";
import {PlantDisplayData} from "../display/EcoSimDisplay.ts";
import Collapsible from "./components/CollapsibleTitle.tsx";

const eventEmitter = EventBus;

const PlantInfoDisplay = () => {
    const [selectedPlant, setSelectedPlant] = useState<PlantDisplayData | null>(null);

    useEffect(() => {
        eventEmitter.on(UiEvents.PlantSelected, setSelectedPlant);

        return () => {
            eventEmitter.off(UiEvents.PlantSelected, setSelectedPlant);
        };
    }, [eventEmitter]);

    if (!selectedPlant) {
        return null; // Hide the component if no plant is selectedå
    }

    return (
        <Collapsible title="Plant Information">
            <div className="tile-layers" style={styles.tileLayers}>
                <p>Coordinates: ({Math.floor(selectedPlant.position.x)}, {Math.floor(selectedPlant.position.y)})</p>
                {Object.keys(selectedPlant).map((layer, index) => {
                    if (!layer) return null;
                    if (typeof selectedPlant[layer] === 'object') return null;
                    
                    return <div key={index} className="tile-layer" style={styles.tileLayer}>
                        <p>{layer} : {selectedPlant[layer]}</p>
                    </div>
                })}
            </div>
        </Collapsible>
    );
};

const styles = {
    tileInfo: {
        border: '1px solid #ccc',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderRadius: '5px',
        width: '200px',
        top: '10px',
        right: '10px',
        color: 'black'
    },
    tileLayers: {
        marginTop: '10px'
    },
    tileLayer: {
        marginBottom: '10px'
    },
    image: {
        maxWidth: '100%',
        height: 'auto'
    }
};

export default PlantInfoDisplay;