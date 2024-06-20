import React from 'react';
import HealthDataDisplay from './HealthDataDisplay';
import {BuildingData} from "../../display/autorpg/AutoRpgDisplay.ts";
import PositionDisplay from "./PositionDisplay.tsx";

const BuildingDataDisplay: React.FC<{ buildingData: BuildingData }> = ({ buildingData }) => (
    <div>
        <div>ID: {buildingData.id}</div>
        <PositionDisplay position={buildingData} />
        <div>Subtype: {buildingData.subtype}</div>
        <div>Type: {buildingData.type}</div>
        <div>Group: {buildingData.group ? "Green" : "Red"}</div>
        <HealthDataDisplay healthData={buildingData} />
    </div>
);

export default BuildingDataDisplay;
