import React from 'react';
import {GameOverAgentData} from "../../display/autorpg/AutoRpgDisplay.ts";

const GameOverAgentDataDisplay: React.FC<{ gameOverAgentData: GameOverAgentData }> = ({ gameOverAgentData }) => (
    <div>
        <div>ID: {gameOverAgentData.id}</div>
        <div>Position: ({gameOverAgentData.x}, {gameOverAgentData.y})</div>
        <div>Subtype: {gameOverAgentData.subtype}</div>
        <div>Type: {gameOverAgentData.type}</div>
    </div>
);

export default GameOverAgentDataDisplay;
