import React from 'react';

interface SidebarProps {
    views: { id: string; label: string; icon?: string }[];
    projects: string[];
    currentView: string;
    onSelectView: (view: string) => void;
    onAddTask: () => void;
    onSearch: (query: string) => void;
    searchValue: string;
    onExploreUsers: () => void;
    onLogout: () => void;
    userEmail?: string;
    userName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    views,
    projects,
    currentView,
    onSelectView,
    onAddTask,
    onSearch,
    searchValue,
    onExploreUsers,
    onLogout,
    userEmail,
    userName
}) => {
    return (
        <aside className="sidebar" style={{
            width: '280px',
            background: '#fafafa',
            borderRight: '1px solid #ddd',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <div style={{ padding: '20px 10px 0 10px', overflowY: 'auto' }}>
                {/* Header Profile / Search */}
                <div style={{ marginBottom: '15px', padding: '0 5px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#db4c3f', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            {(userName || userEmail || 'U').charAt(0).toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#333' }}>{userName || userEmail}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <button
                            onClick={onAddTask}
                            style={{
                                flex: 2,
                                background: '#db4c3f',
                                color: 'white',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}
                        >
                            + Add Task
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => onSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div className="sidebar-section">
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {views.map(view => (
                            <li
                                key={view.id}
                                onClick={() => onSelectView(view.id)}
                                style={{
                                    padding: '8px 10px',
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                    background: currentView === view.id ? '#eee' : 'transparent',
                                    marginBottom: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#333'
                                }}
                            >
                                <span>{view.icon || '•'}</span>
                                <span style={{ fontSize: '0.95rem' }}>{view.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-section" style={{ marginTop: '20px' }}>
                    <h4 style={{ paddingLeft: '10px', marginBottom: '5px', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projects</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {projects.map(project => (
                            <li
                                key={project}
                                onClick={() => onSelectView(project)}
                                style={{
                                    padding: '6px 10px',
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                    background: currentView === project ? '#eee' : 'transparent',
                                    marginBottom: '1px',
                                    fontSize: '0.9rem',
                                    color: '#444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span style={{ color: '#888' }}>#</span> {project}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-section" style={{ marginTop: '20px' }}>
                    <h4 style={{ paddingLeft: '10px', marginBottom: '5px', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Community</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li
                            onClick={onExploreUsers}
                            style={{
                                padding: '8px 10px',
                                cursor: 'pointer',
                                borderRadius: '5px',
                                background: 'transparent',
                                marginBottom: '2px',
                                fontSize: '0.95rem',
                                color: '#333',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <span>👥</span> Browse Users
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Section */}
            <div style={{ padding: '15px', borderTop: '1px solid #eee' }}>
                <button
                    onClick={onLogout}
                    style={{
                        width: '100%',
                        background: 'transparent',
                        color: '#555',
                        border: '1px solid #ddd',
                        padding: '8px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <span>🚪</span> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
