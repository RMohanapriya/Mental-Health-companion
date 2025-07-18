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
        <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 bg-gradient-to-br from-purple-50 to-blue-50">
            Loading journal...
        </div>
    );
    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
            <header className="w-full max-w-3xl flex justify-between items-center py-5 border-b border-purple-200 mb-8">
                <h1 className="text-3xl font-bold text-purple-800 m-0">Your Journal 📓</h1>
                <button onClick={() => router.push('/dashboard')} className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300">
                    Back to Dashboard
                </button>
            </header>

            <main className="w-full max-w-3xl flex flex-col gap-8">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl flex flex-col gap-4 border border-purple-100">
                    <textarea
                        value={newEntryContent}
                        onChange={(e) => setNewEntryContent(e.target.value)}
                        placeholder="What's on your mind today?"
                        rows="6"
                        required
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-gray-800"
                    ></textarea>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="mood" className="font-semibold text-gray-700 text-base">How are you feeling?</label>
                        <select
                            id="mood"
                            value={newEntryMood}
                            onChange={(e) => setNewEntryMood(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-white text-gray-800"
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
                    <div className="flex gap-4 mt-2">
                        <button type="submit" className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-bold hover:bg-purple-700 transition-colors duration-300 shadow-md hover:shadow-lg flex-grow">
                            {editingEntryId ? 'Update Entry' : 'Add Entry'}
                        </button>
                        {editingEntryId && (
                            <button type="button" onClick={() => { setNewEntryContent(''); setNewEntryMood(''); setEditingEntryId(null); }} className="bg-gray-500 text-white px-6 py-3 rounded-lg text-lg font-bold hover:bg-gray-600 transition-colors duration-300 shadow-md hover:shadow-lg flex-grow">
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <div className="flex flex-col gap-5">
                    {entries.length === 0 && (
                        <p className="text-center text-gray-600 italic p-8 bg-white rounded-xl shadow-md border border-gray-100">
                            No journal entries yet. Start writing!
                        </p>
                    )}
                    {entries.map((entry) => (
                        <div key={entry._id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500 relative">
                            <p className="text-sm text-gray-500 mb-2 pb-2 border-b border-dashed border-gray-200">
                                {new Date(entry.date).toLocaleDateString()} - {new Date(entry.date).toLocaleTimeString()}
                            </p>
                            <ReactMarkdown className="text-gray-800 text-base leading-relaxed mb-4">{entry.content}</ReactMarkdown>
                            <p className="text-sm text-gray-600 mb-1">Mood: {entry.mood || 'N/A'}</p>
                            <p className="text-sm text-gray-600">
                                Sentiment: <strong className="text-purple-700">{entry.sentiment?.label || 'N/A'}</strong> (Score: {entry.sentiment?.score?.toFixed(2) || 'N/A'})
                            </p>
                            <div className="flex gap-3 mt-4 pt-4 border-t border-dashed border-gray-200">
                                <button onClick={() => handleEdit(entry)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors duration-300 shadow-sm">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(entry._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors duration-300 shadow-sm">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}