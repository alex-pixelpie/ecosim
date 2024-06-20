import React from 'react';
import HealthDataDisplay from './HealthDataDisplay';
import {MobData} from "../../display/autorpg/AutoRpgDisplay.ts";

const MobDataDisplay: React.FC<{ mobData: MobData }> = ({ mobData }) => (
    <div>
        <div>ID: {mobData.id}</div>
        <div>Position: ({Math.floor(mobData.x)}, {Math.floor(mobData.y)})</div>
        <div>Subtype: {mobData.subtype}</div>
        <div>Type: {mobData.type}</div>
        <div>Group: {mobData.group ? "Green" : "Red"}</div>
        <div>AI:</div>
        <ul>
            <li>Goal: {mobData.goal}</li>
            <li>Action: {mobData.action}</li>
        </ul>
        {mobData.sensoryRange !== undefined && <div>Sensory Range: {mobData.sensoryRange}</div>}
        {mobData.targetsInRange !== undefined && <div>Targets in Range: {mobData.targetsInRange}</div>}
        {mobData.minAttackRange !== undefined && <div>Min Attack Range: {mobData.minAttackRange}</div>}
        {mobData.maxAttackRange !== undefined && <div>Max Attack Range: {mobData.maxAttackRange}</div>}
        <HealthDataDisplay healthData={mobData} />
    </div>
);

export default MobDataDisplay;
