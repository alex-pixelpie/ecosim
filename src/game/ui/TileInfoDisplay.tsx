import React, { useEffect, useState } from 'react';
import {EventBus, UiEvents} from "../EventBus.ts";
import {TileDisplayData} from "../display/EcoSimDisplay.ts";
import Collapsible from "./components/CollapsibleTitle.tsx";

const eventEmitter = EventBus;

const TileInfoDisplay = () => {
    const [selectedTile, setSelectedTile] = useState<TileDisplayData | null>(null);

    useEffect(() => {
        // Listen for the "tile-selected" event
        eventEmitter.on(UiEvents.TileSelected, setSelectedTile);

        // Cleanup listener on component unmount
        return () => {
            eventEmitter.off(UiEvents.TileSelected, setSelectedTile);
        };
    }, [eventEmitter]);

    if (!selectedTile) {
        return null; // Hide the component if no tile is selected
    }

    return (
        <Collapsible title="Tile Information">
            <div className="tile-layers" style={styles.tileLayers}>
                <p>Coordinates: ({selectedTile.position.x}, {selectedTile.position.y})</p>
                {Object.keys(selectedTile).map((layer, index) => {
                    if (!layer) return null;
                    if (typeof selectedTile[layer] === 'object') return null;
                    
                    return <div key={index} className="tile-layer" style={styles.tileLayer}>
                        <p>{layer} : {selectedTile[layer]}</p>
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

export default TileInfoDisplay;