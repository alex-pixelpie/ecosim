import React, { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import SelectedEntityDisplay from "./game/ui/selected/SelectedEntityDisplay.tsx";

function App()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    
    return (
        <div id="app">
            <PhaserGame ref={phaserRef}/>
            <div style={{position: 'absolute', top: 0, right: 0, zIndex: 1000, display:"flex", flexDirection:"column"}}>
                <SelectedEntityDisplay/>
            </div>
        </div>
    )
}

export default App
