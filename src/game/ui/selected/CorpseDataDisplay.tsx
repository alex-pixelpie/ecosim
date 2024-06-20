import React from 'react';
import {CorpseData} from "../../display/autorpg/AutoRpgDisplay.ts";
import PositionDisplay from "./PositionDisplay.tsx";
const CorpseDataDisplay: React.FC<{ corpseData: CorpseData }> = ({ corpseData }) => (
    <div>
        <div>ID: {corpseData.id}</div>
        <PositionDisplay position={corpseData} />
        <div>Subtype: {corpseData.subtype}</div>
        <div>Type: {corpseData.type}</div>
        <div>Rot Factor: {corpseData.rotFactor.toFixed(2)}</div>
    </div>
);

export default CorpseDataDisplay;
