import React, { useState, useRef, useEffect } from 'react';

interface DisplayMenuProps {
    onGroupChange: (group: string) => void;
    onSortChange: (sort: string) => void;
    onFilterPriorityChange: (priority: string) => void;
    currentGroup: string;
    currentSort: string;
    currentFilterPriority: string;
    onReset: () => void;
}

const DisplayMenu: React.FC<DisplayMenuProps> = ({
    onGroupChange,
    onSortChange,
    onFilterPriorityChange,
    currentGroup,
    currentSort,
    currentFilterPriority,
    onReset
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <div className="display-menu-container" ref={menuRef} style={{ position: 'relative' }}>
            <button
                className="btn-secondary"
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
                <span style={{ fontSize: '1.1rem' }}>⚙</span> Filter
            </button>

            {isOpen && (
                <div className="dropdown-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '260px',
                    background: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                    padding: '12px',
                    zIndex: 100,
                    marginTop: '8px',
                    border: '1px solid #eee'
                }}>
                    {/* Sorting Section */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '8px' }}>Sort</div>
                        <select
                            value={currentSort}
                            onChange={(e) => onSortChange(e.target.value)}
                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="dateAdded">Date Added</option>
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                            <option value="alphabetical">Alphabetical</option>
                        </select>
                    </div>

                    {/* Grouping Section */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '8px' }}>Grouping</div>
                        <select
                            value={currentGroup}
                            onChange={(e) => onGroupChange(e.target.value)}
                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="none">None</option>
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                            <option value="project">Project</option>
                        </select>
                    </div>

                    {/* Filter Section */}
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '8px' }}>Filter Priority</div>
                        <select
                            value={currentFilterPriority}
                            onChange={(e) => onFilterPriorityChange(e.target.value)}
                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="all">All</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                        <button
                            onClick={onReset}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: 'none',
                                border: 'none',
                                color: '#db4c3f',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Reset to Default
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisplayMenu;
