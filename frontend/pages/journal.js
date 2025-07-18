import { useState, useEffect } from 'react';
import axios from 'axios'; // For API calls
import { useAuth } from '../context/AuthContext'; // For authentication context
import { useRouter } from 'next/router'; // For navigation
import styles from '../styles/Journal.module.css'; // Import CSS module
import ReactMarkdown from 'react-markdown'; // For rendering markdown content

export default function Journal() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [entries, setEntries] = useState([]); // State for journal entries
    const [newEntryContent, setNewEntryContent] = useState(''); // State for new entry text
    const [newEntryMood, setNewEntryMood] = useState(''); // State for new entry mood
    const [editingEntryId, setEditingEntryId] = useState(null); // State to track which entry is being edited

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            fetchJournalEntries(); // Fetch entries once user is loaded
        }
    }, [user, loading, router]);

    // Function to fetch all journal entries for the user
    const fetchJournalEntries = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/journals`);
            setEntries(res.data);
        } catch (err) {
            console.error('Error fetching journal entries:', err.response?.data?.msg || err.message);
            // TODO: Show error to user
        }
    };

    // Function to handle adding or updating a journal entry
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEntryContent.trim()) return; // Prevent empty entries

        try {
            if (editingEntryId) {
                // If editing an existing entry
                const res = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/journals/${editingEntryId}`, {
                    content: newEntryContent,
                    mood: newEntryMood,
                });
                // Update the entry in the local state
                setEntries(entries.map(entry => (entry._id === editingEntryId ? res.data : entry)));
                setEditingEntryId(null); // Exit editing mode
            } else {
                // If adding a new entry
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/journals`, {
                    content: newEntryContent,
                    mood: newEntryMood,
                });
                // Add the new entry to the top of the list
                setEntries([res.data, ...entries]);
            }
            setNewEntryContent(''); // Clear form fields
            setNewEntryMood('');
        } catch (err) {
            console.error('Error saving journal entry:', err.response?.data?.msg || err.message);
            // TODO: Show error to user
        }
    };

    // Function to handle deleting a journal entry
    const handleDelete = async (id) => {
        // Use a custom modal for confirmation instead of window.confirm in real app
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/journals/${id}`);
                // Remove the deleted entry from local state
                setEntries(entries.filter(entry => entry._id !== id));
            } catch (err) {
                console.error('Error deleting journal entry:', err.response?.data?.msg || err.message);
                // TODO: Show error to user
            }
        }
    };

    // Function to set up form for editing an entry
    const handleEdit = (entry) => {
        setNewEntryContent(entry.content);
        setNewEntryMood(entry.mood || '');
        setEditingEntryId(entry._id);
    };

    if (loading) return <div className={styles.loading}>Loading journal...</div>;
    if (!user) return null; // Redirection handled by useEffect

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Your Journal 📓</h1>
                <button onClick={() => router.push('/dashboard')} className={styles.backButton}>Back to Dashboard</button>
            </header>

            <main className={styles.main}>
                <form onSubmit={handleSubmit} className={styles.journalForm}>
                    <textarea
                        value={newEntryContent}
                        onChange={(e) => setNewEntryContent(e.target.value)}
                        placeholder="What's on your mind today?"
                        rows="6"
                        required
                    ></textarea>
                    <div className={styles.moodSelector}>
                        <label htmlFor="mood">How are you feeling?</label>
                        <select
                            id="mood"
                            value={newEntryMood}
                            onChange={(e) => setNewEntryMood(e.target.value)}
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
                    <button type="submit" className={styles.button}>{editingEntryId ? 'Update Entry' : 'Add Entry'}</button>
                    {editingEntryId && (
                        <button type="button" onClick={() => { setNewEntryContent(''); setNewEntryMood(''); setEditingEntryId(null); }} className={`${styles.button} ${styles.cancelButton}`}>
                            Cancel Edit
                        </button>
                    )}
                </form>

                <div className={styles.entryList}>
                    {entries.length === 0 && <p className={styles.noEntries}>No journal entries yet. Start writing!</p>}
                    {entries.map((entry) => (
                        <div key={entry._id} className={styles.journalEntryCard}>
                            <p className={styles.entryDate}>{new Date(entry.date).toLocaleDateString()} - {new Date(entry.date).toLocaleTimeString()}</p>
                            <ReactMarkdown>{entry.content}</ReactMarkdown>
                            <p className={styles.entryMood}>Mood: {entry.mood || 'N/A'}</p>
                            <p className={styles.entrySentiment}>Sentiment: <strong>{entry.sentiment?.label || 'N/A'}</strong> (Score: {entry.sentiment?.score?.toFixed(2) || 'N/A'})</p>
                            <div className={styles.entryActions}>
                                <button onClick={() => handleEdit(entry)} className={styles.editButton}>Edit</button>
                                <button onClick={() => handleDelete(entry._id)} className={styles.deleteButton}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}