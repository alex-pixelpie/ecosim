import React, { useEffect, useState } from 'react';
import {EventBus, GameEvents} from "../EventBus.ts";

const GameOverPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [victory, setVictory] = useState(false);

    useEffect(() => {
        const handleGameOver = ({ victory }) => {
            setVictory(victory);
            setIsVisible(true);
        };

        EventBus.on(GameEvents.GameOver, handleGameOver);

        return () => {
            EventBus.off(GameEvents.GameOver, handleGameOver);
        };
    }, []);

    const handleRestart = () => {
        setIsVisible(false);
        EventBus.emit(GameEvents.GameStart);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div style={styles.overlay}>
            <div style={styles.popup}>
                <h2>{victory ? 'Victory!' : 'Defeat...'}</h2>
                <button onClick={handleRestart} style={styles.button}>Restart</button>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    popup: {
        width: '300px',
        height: '300px',
        backgroundColor: 'beige',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        color: 'black',
    },
    button: {
        width: '100px',
        height: '50px',
        fontSize: '16px',
        backgroundColor: '#007bff',
        color: 'beige',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px',
    },
};

export default GameOverPopup;