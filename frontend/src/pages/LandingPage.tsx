import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="logo">✅ TodoApp</div>
                <div className="nav-links">
                    {isAuthenticated ? (
                        <Link to="/app" className="btn-primary">Go to App</Link>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn-primary">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            <header className="hero-section">
                <div className="hero-content">
                    <h1>Organize your work and life, finally.</h1>
                    <p>Become focused, organized, and calm with TodoApp. The world's #1 task manager and to-do list app.</p>
                    <div className="hero-actions">
                        {isAuthenticated ? (
                            <Link to="/app" className="btn-large">Open My Tasks</Link>
                        ) : (
                            <Link to="/register" className="btn-large">Start for Free</Link>
                        )}
                    </div>
                </div>
                <div className="hero-image">
                    {/* Placeholder for illustration */}
                    <div className="glass-card mockup">
                        <div className="mockup-header">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                        </div>
                        <div className="mockup-body">
                            <div className="skeleton-line title"></div>
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line short"></div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="features-section">
                <div className="feature-card">
                    <div className="icon">🚀</div>
                    <h3>Fast & Efficient</h3>
                    <p>Add tasks in seconds and organize them with ease.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">📅</div>
                    <h3>Stay on Schedule</h3>
                    <p>Set due dates and reminders so you never miss a deadline.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">👥</div>
                    <h3>Collaborate</h3>
                    <p>Share your lists and see what others are working on.</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
