import React from 'react';

const PositionDisplay: React.FC<{ position: {x:number, y:number} }> = ({ position }) => (
    <div>Position: ({Math.floor(position.x)}, {Math.floor(position.y)})</div>
);

export default PositionDisplay;
