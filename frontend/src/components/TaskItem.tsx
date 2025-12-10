import React from 'react';

interface Task {
    id: number;
    title: string;
    description: string;
    priority: string;
    isComplete: boolean;
    dueDate: string;
    category: string;
    isPublic: boolean;
    attachment?: string;
}

interface TaskItemProps {
    task: Task;
    onToggleComplete: (task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onEdit, onDelete }) => {
    const isLate = !task.isComplete && task.dueDate && new Date(task.dueDate) < new Date();

    return (
        <li className={`task-item-row ${task.priority}`} style={{
            display: 'flex',
            alignItems: 'flex-start',
            padding: '12px 0',
            borderBottom: '1px solid #eee',
            gap: '12px'
        }}>
            {/* Checkbox */}
            <div
                onClick={() => onToggleComplete(task)}
                style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px solid ${task.priority === 'high' ? '#ff3b30' : task.priority === 'medium' ? '#ffcc00' : '#888'}`,
                    background: task.isComplete ? (task.priority === 'high' ? '#ff3b30' : task.priority === 'medium' ? '#ffcc00' : '#888') : 'transparent',
                    cursor: 'pointer',
                    marginTop: '3px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {task.isComplete && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
                <div style={{ color: task.isComplete ? '#aaa' : '#333' }}>
                    {task.title}
                </div>
                {task.description && <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>{task.description}</div>}
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {task.dueDate && (
                        <span style={{ color: isLate ? '#d00' : '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            📅 {new Date(task.dueDate).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    {task.category && <span style={{ color: '#058527' }}>#{task.category}</span>}
                    {task.isPublic && <span style={{ border: '1px solid #ccc', borderRadius: '3px', padding: '0 4px' }}>Public</span>}
                    {task.attachment && <a href={`http://localhost:3000/files/${task.attachment}`} target="_blank" rel="noopener noreferrer" style={{ color: '#007aff' }}>📎 Attachment</a>}
                </div>
            </div>

            {/* Actions */}
            <div className="task-actions" style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✏️</button>
                <button onClick={() => onDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
            </div>
        </li>
    );
};

export default TaskItem;
