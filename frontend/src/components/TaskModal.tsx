import React, { useState, useEffect } from 'react';
import api from '../api/axios';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: () => void; // Trigger refresh
    task?: any; // Task to edit
}

const PREDEFINED_CATEGORIES = ['Homework', 'Event', 'Meeting'];

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onTaskCreated, task }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');

    // Category state
    const [selectedCategory, setSelectedCategory] = useState(PREDEFINED_CATEGORIES[0]);
    const [customCategory, setCustomCategory] = useState('');

    const [isPublic, setIsPublic] = useState(true);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setPriority(task.priority);
            setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '');

            // Handle Category Logic
            const cat = task.category || '';
            if (PREDEFINED_CATEGORIES.includes(cat)) {
                setSelectedCategory(cat);
                setCustomCategory('');
            } else if (cat) {
                setSelectedCategory('Others');
                setCustomCategory(cat);
                setSelectedCategory('Homework');
                setCustomCategory('');
            }
            setIsPublic(task.isPublic ?? true);

        } else {
            // Reset form for create mode
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate('');
            setSelectedCategory('Homework');
            setCustomCategory('');
            setIsPublic(true);
        }
        setFile(null); // Always reset file
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let attachment = task?.attachment || '';
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await api.post('/files/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                attachment = uploadRes.data.filename;
            }

            // Determine final category value
            const finalCategory = selectedCategory === 'Others' ? customCategory : selectedCategory;

            const payload = {
                title,
                description,
                priority,
                category: finalCategory,
                dueDate: dueDate ? dueDate : undefined,
                attachment,
                isPublic,
            };

            if (task) {
                await api.patch(`/tasks/${task.id}`, payload);
            } else {
                await api.post('/tasks', payload);
            }

            onTaskCreated();
            onClose();
        } catch (error: any) {
            console.error('Failed to save task', error);
            const msg = error.response?.data?.message || error.message || 'Failed to save task';
            alert(`Error: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '500px', maxWidth: '90vw' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{task ? 'Edit Task' : 'New Task'}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 5px' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="What would you like to do?"
                            style={{ fontSize: '1.1rem', padding: '10px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                minHeight: '80px',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label>Priority</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                <option value="low">Low 🟢</option>
                                <option value="medium">Medium 🟡</option>
                                <option value="high">High 🔴</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {PREDEFINED_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option value="Others">Custom...</option>
                            </select>
                        </div>
                    </div>

                    {selectedCategory === 'Others' && (
                        <div className="form-group">
                            <label>Custom Category Name</label>
                            <input
                                type="text"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                placeholder="e.g. Gym, Shopping"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Due Date</label>
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', alignItems: 'end' }}>
                        <div className="form-group">
                            <label>Attachment</label>
                            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    style={{ padding: '5px' }}
                                />
                            </div>
                            {task?.attachment && (
                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                    Current: <a href={`http://localhost:3000/files/${task.attachment}`} target="_blank" rel="noopener noreferrer" style={{ color: '#db4c3f', textDecoration: 'underline' }}>{task.attachment}</a>
                                </div>
                            )}
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span>Public</span>
                            </label>
                        </div>
                    </div>

                    <div className="modal-actions" style={{ paddingTop: '20px', borderTop: '1px solid #eee' }}>
                        <button type="button" onClick={onClose} className="btn-secondary" style={{ marginRight: '10px' }}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ minWidth: '100px' }}>{task ? 'Save Changes' : 'Add Task'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default TaskModal;
