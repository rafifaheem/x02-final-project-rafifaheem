import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskModal from '../components/TaskModal';
import Sidebar from '../components/Sidebar';
import TaskItem from '../components/TaskItem';
import DisplayMenu from '../components/DisplayMenu';

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

const DashboardPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [search, setSearch] = useState('');
    const [currentView, setCurrentView] = useState('tasks'); // 'tasks', 'upcoming', 'completed', 'overdue' or project name
    const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);

            // Extract categories logic
            const incomingTasks = response.data as Task[];
            const cats = incomingTasks.map(t => t.category).filter(c => c && c.trim() !== '');
            setUniqueCategories(Array.from(new Set(cats)));

        } catch (error) {
            console.error('Failed to fetch tasks', error);
        }
    };

    const handleCreate = () => {
        setTaskToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task: Task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const handleToggleComplete = async (task: Task) => {
        try {
            await api.patch(`/tasks/${task.id}`, { isComplete: !task.isComplete });
            fetchTasks(); // Improvement: could optimise to update local state
        } catch (error) {
            console.error('Failed to update task', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Filter Logic based on View
    const getFilteredTasks = () => {
        let filtered = tasks;

        // 1. View Filter
        if (currentView === 'completed') {
            filtered = tasks.filter(t => t.isComplete);
        } else {
            // For all other views, show ONLY incomplete tasks
            filtered = tasks.filter(t => !t.isComplete);

            if (currentView === 'tasks') {
                // Tasks (formerly Inbox) = Show all incomplete tasks
            } else if (currentView === 'overdue') {
                const todayStr = new Date().toISOString().split('T')[0];
                // Overdue means due date is strictly less than today
                filtered = filtered.filter(t => t.dueDate && t.dueDate < todayStr);
            } else if (currentView === 'upcoming') {
                const todayStr = new Date().toISOString().split('T')[0];
                filtered = filtered.filter(t => t.dueDate && t.dueDate > todayStr);
            } else {
                // It's a project/category
                filtered = filtered.filter(t => t.category === currentView);
            }
        }

        // 2. Search Filter (Global)
        if (search) {
            filtered = filtered.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
        }

        return filtered;
    };

    // Display Menu State
    const [grouping, setGrouping] = useState('none');
    const [sorting, setSorting] = useState('dateAdded');
    const [filterPriority, setFilterPriority] = useState('all');

    // ... existing filters ...
    const getProcessedTasks = () => {
        let processed = getFilteredTasks();

        // 1. Filter Priority
        if (filterPriority !== 'all') {
            processed = processed.filter(t => t.priority === filterPriority);
        }

        // 2. Sort
        processed.sort((a, b) => {
            if (sorting === 'dueDate') {
                return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
            } else if (sorting === 'priority') {
                const map = { high: 1, medium: 2, low: 3 };
                return (map[a.priority as keyof typeof map] || 3) - (map[b.priority as keyof typeof map] || 3);
            } else if (sorting === 'alphabetical') {
                return a.title.localeCompare(b.title);
            } else {
                // Date Added (ID desc)
                return b.id - a.id;
            }
        });

        return processed;
    };

    const groupedTasks = () => {
        const tasks = getProcessedTasks();
        if (grouping === 'none') return { 'All Tasks': tasks };

        const groups: { [key: string]: Task[] } = {};

        tasks.forEach(task => {
            let key = 'Uncategorized';
            if (grouping === 'dueDate') {
                key = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date';
            } else if (grouping === 'priority') {
                key = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            } else if (grouping === 'project') {
                key = task.category || 'No Project';
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(task);
        });

        return groups;
    };

    const taskGroups = groupedTasks();

    return (
        <div className="dashboard-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar
                views={[
                    { id: 'tasks', label: 'Task', icon: '📝' },
                    { id: 'upcoming', label: 'Upcoming', icon: '🗓️' },
                    { id: 'completed', label: 'Completed', icon: '✅' },
                    { id: 'overdue', label: 'Overdue', icon: '⚠' },
                ]}
                projects={uniqueCategories}
                currentView={currentView}
                onSelectView={setCurrentView}
                onAddTask={handleCreate}
                onSearch={setSearch}
                searchValue={search}
                onExploreUsers={() => navigate('/users')}
                onLogout={handleLogout}
                userEmail={user?.email}
                userName={user?.name}
            />

            <main className="main-content" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ textTransform: 'capitalize', margin: 0 }}>{currentView}</h2>
                        <small style={{ color: '#888' }}>{new Date().toLocaleDateString()}</small>
                    </div>
                    <DisplayMenu
                        currentGroup={grouping}
                        onGroupChange={setGrouping}
                        currentSort={sorting}
                        onSortChange={setSorting}
                        currentFilterPriority={filterPriority}
                        onFilterPriorityChange={setFilterPriority}
                        onReset={() => {
                            setGrouping('none');
                            setSorting('dateAdded');
                            setFilterPriority('all');
                        }}
                    />
                </header>

                <div className="task-container">
                    {Object.keys(taskGroups).map(group => (
                        <div key={group} style={{ marginBottom: '30px' }}>
                            {grouping !== 'none' && (
                                <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '12px', color: '#666' }}>
                                    {group} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>({taskGroups[group].length})</span>
                                </h4>
                            )}
                            <ul className="task-list" style={{ listStyle: 'none', padding: 0 }}>
                                {taskGroups[group].map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggleComplete={handleToggleComplete}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </ul>
                        </div>
                    ))}

                    {getProcessedTasks().length === 0 && (
                        <div style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
                            <p>{currentView === 'completed' ? 'No completed tasks yet.' : 'All clear! 🏝️'}</p>
                        </div>
                    )}
                </div>
            </main>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTaskCreated={fetchTasks}
                task={taskToEdit}
            />
        </div>
    );
};

export default DashboardPage;
