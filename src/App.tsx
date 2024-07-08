import React, { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import SelectedEntityDisplay from "./game/ui/selected/SelectedEntityDisplay.tsx";
import SpeedControl from "./game/ui/SpeedControl.tsx";
import MoneyDisplay from "./game/ui/MoneyDisplay.tsx";

function App()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    
    return (
        <div id="app">
            <PhaserGame ref={phaserRef}/>
            <div style={{position: 'absolute', top: 0, right: 0, zIndex: 1000, display:"flex", flexDirection:"column", backgroundColor: '#f9f9f9', fontFamily: 'Arial, sans-serif', color: '#333'}}>
                <SelectedEntityDisplay/>
                <SpeedControl/>
                <MoneyDisplay/>
            </div>
        </div>
    )
}

export default App
