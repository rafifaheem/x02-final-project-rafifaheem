import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

const UserPublicTasksPage: React.FC = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const { userId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTasks();
    }, [userId]);

    const fetchTasks = async () => {
        try {
            const response = await api.get(`/tasks/public/${userId}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch public tasks', error);
        }
    };

    return (
        <div className="landing-container" style={{ padding: '40px 20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#333' }}>Public Tasks</h1>
                <button onClick={() => navigate('/users')} className="btn-secondary">← Back to Users</button>
            </header>
            <main style={{ maxWidth: '800px', margin: '0 auto' }}>
                <ul className="task-list">
                    {tasks.length === 0 ? <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>No public tasks shared by this user.</p> : null}
                    {tasks.map((task) => {
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isComplete;
                        return (
                            <li key={task.id} style={{
                                background: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '500', fontSize: '1rem', color: '#333', marginBottom: '4px' }}>
                                        {task.title}
                                    </div>
                                    {task.description && <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '6px' }}>{task.description}</div>}
                                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#888' }}>
                                        {task.dueDate && <span style={{ color: isOverdue ? '#d00' : '#888' }}>📅 {new Date(task.dueDate).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                                        {task.priority && (
                                            <span style={{
                                                textTransform: 'capitalize',
                                                color: task.priority === 'high' ? '#d00' : task.priority === 'medium' ? '#f5a623' : 'green'
                                            }}>
                                                {task.priority} Priority
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {task.isComplete ? (
                                        <span style={{ background: '#e0f2f1', color: '#00695c', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Done</span>
                                    ) : isOverdue ? (
                                        <span style={{ background: '#ffebee', color: '#c62828', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Overdue</span>
                                    ) : (
                                        <span style={{ background: '#fff3e0', color: '#ef6c00', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Pending</span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </main>
        </div>
    );
};

export default UserPublicTasksPage;
