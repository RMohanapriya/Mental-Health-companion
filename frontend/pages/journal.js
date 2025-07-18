import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';

export default function Journal() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [entries, setEntries] = useState([]);
    const [newEntryContent, setNewEntryContent] = useState('');
    const [newEntryMood, setNewEntryMood] = useState('');
    const [editingEntryId, setEditingEntryId] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            fetchJournalEntries();
        }
    }, [user, loading, router]);

    const fetchJournalEntries = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/journals`);
            setEntries(res.data);
        } catch (err) {
            console.error('Error fetching journal entries:', err.response?.data?.msg || err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEntryContent.trim()) return;

        try {
            if (editingEntryId) {
                const res = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/journals/${editingEntryId}`, {
                    content: newEntryContent,
                    mood: newEntryMood,
                });
                setEntries(entries.map(entry => (entry._id === editingEntryId ? res.data : entry)));
                setEditingEntryId(null);
            } else {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/journals`, {
                    content: newEntryContent,
                    mood: newEntryMood,
                });
                setEntries([res.data, ...entries]);
            }
            setNewEntryContent('');
            setNewEntryMood('');
        } catch (err) {
            console.error('Error saving journal entry:', err.response?.data?.msg || err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/journals/${id}`);
                setEntries(entries.filter(entry => entry._id !== id));
            } catch (err) {
                console.error('Error deleting journal entry:', err.response?.data?.msg || err.message);
            }
        }
    };

    const handleEdit = (entry) => {
        setNewEntryContent(entry.content);
        setNewEntryMood(entry.mood || '');
        setEditingEntryId(entry._id);
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light text-muted">
            Loading journal...
        </div>
    );
    if (!user) return null;

    return (
        <div className="d-flex flex-column align-items-center min-vh-100 p-4 bg-light">
            <header className="w-100 d-flex justify-content-between align-items-center py-3 border-bottom mb-4" style={{ maxWidth: '800px' }}>
                <h1 className="h3 fw-bold text-dark m-0">Your Journal 📓</h1>
                <button onClick={() => router.push('/dashboard')} className="btn btn-secondary shadow-sm">
                    Back to Dashboard
                </button>
            </header>

            <main className="w-100" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleSubmit} className="bg-white p-4 rounded-4 shadow-lg mb-4 border border-light">
                    <div className="mb-3">
                        <textarea
                            value={newEntryContent}
                            onChange={(e) => setNewEntryContent(e.target.value)}
                            placeholder="What's on your mind today?"
                            rows="6"
                            required
                            className="form-control"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="mood" className="form-label fw-semibold text-dark">How are you feeling?</label>
                        <select
                            id="mood"
                            value={newEntryMood}
                            onChange={(e) => setNewEntryMood(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Select Mood</option>
                            <option value="happy">😊 Happy</option>
                            <option value="neutral">😐 Neutral</option>
                            <option value="sad">😞 Sad</option>
                            <option value="anxious">😟 Anxious</option>
                            <option value="angry">😠 Angry</option>
                            <option value="grateful">🙏 Grateful</option>
                        </select>
                    </div>
                    <div className="d-flex gap-3">
                        <button type="submit" className="btn btn-primary btn-lg flex-grow-1 shadow-sm">
                            {editingEntryId ? 'Update Entry' : 'Add Entry'}
                        </button>
                        {editingEntryId && (
                            <button type="button" onClick={() => { setNewEntryContent(''); setNewEntryMood(''); setEditingEntryId(null); }} className="btn btn-secondary btn-lg flex-grow-1 shadow-sm">
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <div className="d-flex flex-column gap-3">
                    {entries.length === 0 && (
                        <p className="text-center text-muted p-4 bg-white rounded-4 shadow-sm border border-light">
                            No journal entries yet. Start writing!
                        </p>
                    )}
                    {entries.map((entry) => (
                        <div key={entry._id} className="card shadow-sm border-0 rounded-4" style={{ borderLeft: '5px solid #6f42c1' }}>
                            <div className="card-body">
                                <p className="card-subtitle text-muted mb-2 border-bottom pb-2">
                                    {new Date(entry.date).toLocaleDateString()} - {new Date(entry.date).toLocaleTimeString()}
                                </p>
                                <ReactMarkdown className="card-text text-dark mb-3">{entry.content}</ReactMarkdown>
                                <p className="card-text text-muted mb-1">Mood: {entry.mood || 'N/A'}</p>
                                <p className="card-text text-muted">
                                    Sentiment: <strong className="text-purple">{entry.sentiment?.label || 'N/A'}</strong> (Score: {entry.sentiment?.score?.toFixed(2) || 'N/A'})
                                </p>
                                <div className="d-flex gap-2 mt-3 pt-3 border-top">
                                    <button onClick={() => handleEdit(entry)} className="btn btn-sm btn-success shadow-sm">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(entry._id)} className="btn btn-sm btn-danger shadow-sm">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}