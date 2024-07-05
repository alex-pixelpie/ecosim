import React, { useEffect, useState } from 'react';
import {
    BuildingData,
    CorpseData,
    DisplayEntityType,
    GameOverAgentData,
    MobData, SelectableDisplayEntityData
} from "../../display/autorpg/AutoRpgDisplay.ts";
import GameOverAgentDataDisplay from "./GameOverAgentDataDisplay.tsx";
import BuildingDataDisplay from "./BuildingDataDisplay.tsx";
import CorpseDataDisplay from "./CorpseDataDisplay.tsx";
import MobDataDisplay from "./MobDataDisplay.tsx";
import {EventBus, UiEvents} from "../../EventBus.ts";
import CollapsibleTitle from "../components/CollapsibleTitle.tsx";

const SelectedEntityUI: React.FC = () => {
    const [selectedEntity, setSelectedEntity] = useState<SelectableDisplayEntityData | null>(null);

    useEffect(() => {
        const handleEntitySelected = (data: { selected?: SelectableDisplayEntityData }) => {
            setSelectedEntity(data.selected || null);
        };

        EventBus.on(UiEvents.EntitySelected, handleEntitySelected);

        return () => {
            EventBus.off(UiEvents.EntitySelected, handleEntitySelected);
        };
    }, []);

    if (!selectedEntity) {
        return null;
    }
    let EntityDisplayComponent;

    switch (selectedEntity.type) {
        case DisplayEntityType.Mob:
            EntityDisplayComponent = <MobDataDisplay mobData={selectedEntity as MobData} />;
            break;
        case DisplayEntityType.Corpse:
            EntityDisplayComponent = <CorpseDataDisplay corpseData={selectedEntity as CorpseData} />;
            break;
        case DisplayEntityType.Building:
            EntityDisplayComponent = <BuildingDataDisplay buildingData={selectedEntity as BuildingData} />;
            break;
        case DisplayEntityType.GameOverAgent:
            EntityDisplayComponent = <GameOverAgentDataDisplay gameOverAgentData={selectedEntity as GameOverAgentData} />;
            break;
        default:
            return null;
    }
    
    return (
        <CollapsibleTitle title="Selected Entity">
            <div style={styles.container}>
                {EntityDisplayComponent}
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
    }
};

export default SelectedEntityUI;