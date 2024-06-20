import React from 'react';
import {CorpseData} from "../../display/autorpg/AutoRpgDisplay.ts";
const CorpseDataDisplay: React.FC<{ corpseData: CorpseData }> = ({ corpseData }) => (
    <div>
        <div>ID: {corpseData.id}</div>
        <div>Position: ({corpseData.x}, {corpseData.y})</div>
        <div>Subtype: {corpseData.subtype}</div>
        <div>Type: {corpseData.type}</div>
        <div>Rot Factor: {corpseData.rotFactor}</div>
    </div>
);

export default CorpseDataDisplay;
