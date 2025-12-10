import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

const UsersListPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    return (
        <div className="landing-container" style={{ padding: '40px 20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ background: '-webkit-linear-gradient(45deg, #db4c3f, #ff9068)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    Community
                </h1>
                <button onClick={() => navigate('/app')} className="btn-secondary">← Back to Dashboard</button>
            </header>
            <main>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {users.map((user) => (
                        <div key={user.id} className="feature-card" style={{ background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#db4c3f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user.name || 'Unnamed User'}</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>{user.email}</p>
                                </div>
                            </div>
                            <Link to={`/users/${user.id}`}>
                                <button className="btn-primary" style={{ width: '100%' }}>View Public Tasks</button>
                            </Link>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default UsersListPage;
