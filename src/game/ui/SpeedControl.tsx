import React, { useState } from 'react';
import {Configs} from "../configs/Configs.ts";
import CollapsibleTitle from "./components/CollapsibleTitle.tsx";

const SpeedControl: React.FC = () => {
    const [speed, setSpeed] = useState(Configs.sessionConfig.speed);

    const updateSpeed = (newSpeed: number) => {
        Configs.sessionConfig.speed = newSpeed;
        setSpeed(newSpeed);
    };

    const handlePlayPause = () => {
        if (speed === 0) {
            updateSpeed(1); // Resume to normal speed
        } else {
            updateSpeed(0); // Pause
        }
    };

    const handleDoubleSpeed = () => {
        updateSpeed(Math.max(Configs.sessionConfig.minSpeed, Configs.sessionConfig.speed - 0.1));
    };

    const handleHalfSpeed = () => {
        updateSpeed(Math.min(Configs.sessionConfig.maxSpeed, Configs.sessionConfig.speed + 0.1));
    };

    const speedsDisplay = speed ? (speed).toFixed(2).concat("x"): "0";
    
    return (
        <CollapsibleTitle title="Speed">
            <div style={styles.container}>
                <div style={styles.buttonsContainer}>
                    <button onClick={handleHalfSpeed} style={styles.button}>{"⏪︎"}</button>
                    <button onClick={handlePlayPause} style={styles.button}>
                        {speed === 0 ? '▶' : '⏸︎'}
                    </button>
                    <button onClick={handleDoubleSpeed} style={styles.button}>{"⏩︎"}</button>
                </div>
                <div>Speed: {speedsDisplay}</div>
            </div>
        </CollapsibleTitle>
    );
};

const styles = {
    container: {
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '5px',
        maxWidth: '300px',
        backgroundColor: '#f9f9f9',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
    },
    button: {
        margin: '5px',
        padding: '5px 10px',
        fontSize: '14px',
        width: '40px',
        height: '40px',
    },
    buttonsContainer:{
        display: 'flex',
        justifyContent: 'center',
    }
};

export default SpeedControl;