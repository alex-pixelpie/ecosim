import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface CollapsibleProps {
    title: string;
    children: React.ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({ title, children }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header} onClick={toggleCollapse}>
                <h3 style={styles.headerText}>{title}</h3>
                {isCollapsed ? <FaChevronRight style={styles.icon} /> : <FaChevronDown style={styles.icon} />}
            </div>
            <div style={{ ...styles.content, height: isCollapsed ? '0px' : 'auto' }}>
                {children}
            </div>
        </div>
    );
};

const styles = {
    container: {
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#000000',
        marginBottom: '10px',
        overflow: 'hidden' as 'hidden',
        transition: 'height 0.3s ease',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '10px',
        backgroundColor: '#000000',
    },
    headerText: {
        flex: 1,
        margin: 0,
    },
    icon: {
        transition: 'transform 0.3s ease',
    },
    content: {
        overflow: 'hidden',
        transition: 'height 0.3s ease',
    },
};

export default Collapsible;
