import React, { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
// import TileInfoDisplay from "./game/ui/TileInfoDisplay.tsx";
// import CloudCoverModuleControls from "./game/ui/CloudCoverModuleControls.tsx";
// import PlantInfoDisplay from "./game/ui/PlantInfoDisplay.tsx";
import GameOverPopup from "./game/ui/GameOverPopup.tsx";

function App()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    
    return (
        <div id="app">
            <PhaserGame ref={phaserRef}/>
            <GameOverPopup/>
            {/*<div style={{position: 'absolute', top: 0, right: 0, zIndex: 1000, display:"flex", flexDirection:"column"}}>*/}
            {/*    <div style={{ marginBottom: '10px' }}>*/}
            {/*        <CloudCoverModuleControls />*/}
            {/*    </div>*/}
            {/*    <div style={{ marginBottom: '10px' }}>*/}
            {/*        <TileInfoDisplay />*/}
            {/*    </div>*/}
            {/*    <div style={{ marginBottom: '10px' }}>*/}
            {/*        <PlantInfoDisplay/>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    )
}

export default App
