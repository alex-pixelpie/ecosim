import React from 'react';
import HealthDataDisplay from './HealthDataDisplay';
import {MobData} from "../../display/autorpg/AutoRpgDisplay.ts";
import PositionDisplay from "./PositionDisplay.tsx";

const MobDataDisplay: React.FC<{ mobData: MobData }> = ({ mobData }) => (
    <div>
        <div>ID: {mobData.id}</div>
        <PositionDisplay position={mobData} />
        <div>Subtype: {mobData.subtype}</div>
        <div>Type: {mobData.type}</div>
        <div>Group: {mobData.group ? "Green" : "Red"}</div>
        {mobData.sensoryRange !== undefined && <div>Sensory Range: {mobData.sensoryRange}</div>}
        {mobData.targetsInRange !== undefined && <div>Targets in Range: {mobData.targetsInRange}</div>}
        {mobData.minAttackRange !== undefined && <div>Min Attack Range: {mobData.minAttackRange}</div>}
        {mobData.maxAttackRange !== undefined && <div>Max Attack Range: {mobData.maxAttackRange}</div>}
        <HealthDataDisplay healthData={mobData} />
        <ul>
            <li>Goal: {mobData.goal}</li>
            <li>Action: {mobData.action}</li>
        </ul>
    </div>
);

export default MobDataDisplay;
