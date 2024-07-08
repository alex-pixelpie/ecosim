import React, {useEffect, useState} from 'react';
import {PlayerDisplayData} from "../display/autorpg/AutoRpgDisplay.ts";
import {EventBus, GameEvents} from "../EventBus.ts";

const MoneyDisplay: React.FC = () => {
    const [playerData, setPlayerData] = useState<PlayerDisplayData | null>(null);

    useEffect(() => {
        const handleEntitySelected = (data: PlayerDisplayData) => {
            setPlayerData(data);
        };

        EventBus.on(GameEvents.PlayerStateUpdated, handleEntitySelected);

        return () => {
            EventBus.off(GameEvents.PlayerStateUpdated, handleEntitySelected);
        };
    }, []);

    
    return (
            <div style={styles.container}>
                <div style={styles.innerContainer}><div>{playerData?.coins || 0}</div><img src="/assets/icons/coin-icon.png" alt="image"/></div>
            </div>
    );
};

const styles = {
    container: {
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '5px',
        maxWidth: '300px',
        color: '#f9f9f9',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#333',
    },
    innerContainer: {
        display: 'flex',
        flexDirection: 'row' as 'row',
        alignItems: 'center' as 'center',
    },
};

export default MoneyDisplay;