import React, { useEffect, useState } from 'react';
import { EventBus, UiEvents } from '../EventBus.ts';
import {CloudCoverModule} from "../logic/modules/CloudCoverModule.ts";
import CloudsCoverConfig = CloudCoverModule.CloudsCoverConfig;
import Collapsible from "./components/CollapsibleTitle.tsx";

const configMinMaxValues = {
    thicknessSize: { min: 0, max: 200 },
    windSize: { min: 0, max: 200 },
    windStrength: { min: 0, max: 5 },
    rotationSpeed: { min: 0, max: 5 },
    cloudsChangeSpeed: { min: 0, max: 5 },
    coverCutoff: { min: 0, max: 1 },
    speedFactor: { min: 0, max: 3 }
};

const displayNames = {
    thicknessSize: 'Thickness Size',
    windSize: 'Wind Size',
    windStrength: 'Wind Strength',
    rotationSpeed: 'Wind Rotation Speed',
    cloudsChangeSpeed: 'Clouds Change Speed',
    coverCutoff: 'Cover Cutoff',
    speedFactor: 'Speed Factor'
};

const eventEmitter = EventBus;

const CloudCoverModuleControls = () => {
    const [cloudsCoverConfig, setCloudsCoverConfig] = useState<CloudsCoverConfig | null>(new CloudsCoverConfig());

    useEffect(() => {
        // Listen for the WindConfigCreated event
        eventEmitter.on(UiEvents.WindConfigCreated, setCloudsCoverConfig);

        // Cleanup listener on component unmount
        return () => {
            eventEmitter.off(UiEvents.WindConfigCreated, setCloudsCoverConfig);
        };
    }, []);

    if (!cloudsCoverConfig) {
        return null; // Hide the component if there's no config
    }

    useEffect(() => {
        eventEmitter.emit(UiEvents.WindConfigUpdated, cloudsCoverConfig);
    }, [cloudsCoverConfig]);

    const handleSliderChange = (property: keyof CloudsCoverConfig, value: number) => {
        setCloudsCoverConfig((prevConfig) => {
            if (!prevConfig) return prevConfig;
            const newConfig = { ...prevConfig, [property]: value };
            eventEmitter.emit(UiEvents.WindConfigUpdated, newConfig);
            return newConfig;
        });
    };

    return (
        <Collapsible title="Clouds Cover Controls">
            {Object.keys(configMinMaxValues).map((key) => {
                const minMax = configMinMaxValues[key as keyof CloudsCoverConfig];
                return (
                    <div key={key} style={styles.control}>
                        <label>{displayNames[key as keyof CloudsCoverConfig]}</label>
                        <input
                            type="range"
                            min={minMax.min}
                            max={minMax.max}
                            step="0.1"
                            value={cloudsCoverConfig[key as keyof CloudsCoverConfig]}
                            onChange={(e) =>
                                handleSliderChange(key as keyof CloudsCoverConfig, Number(e.target.value))
                            }
                        />
                        <span>{cloudsCoverConfig[key as keyof CloudsCoverConfig]}</span>
                    </div>
                );
            })}
        </Collapsible>
    );
};

const styles = {
    tileInfo: {
        border: '1px solid #ccc',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderRadius: '5px',
        width: '300px',
        color: 'black',
        top: '10px',
        right: '10px',
        transition: 'height 0.3s ease'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    headerText: {
        flex: 1,
        margin: 0,
        cursor: 'pointer',
    },
    icon: {
        transition: 'transform 0.3s ease',
    },
    controlsContainer: {
        overflow: 'hidden',
        transition: 'height 0.3s ease',
    },
    control: {
        margin: '10px 0',
        display: 'flex',
        flexDirection: 'column' as 'column',
    }
};

export default CloudCoverModuleControls;
