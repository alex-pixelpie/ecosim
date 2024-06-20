import React from 'react';
import {HealthData} from "../../display/autorpg/AutoRpgDisplay.ts";

const HealthDataDisplay: React.FC<{ healthData: HealthData }> = ({ healthData }) => (
    <div>
        <div>Health: {healthData.health}</div>
        {healthData.maxHealth !== undefined && <div>Max Health: {healthData.maxHealth}</div>}
    </div>
);

export default HealthDataDisplay;