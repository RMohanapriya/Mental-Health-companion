import { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // For API calls
import { useAuth } from '../context/AuthContext'; // For authentication context
import { useRouter } from 'next/router'; // For navigation
import styles from '../styles/Chatbot.module.css'; // Import CSS module

export default function Chatbot() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState([]); // State for chat messages
    const [input, setInput] = useState(''); // State for user input
    const messagesEndRef = useRef(null); // Ref for auto-scrolling chat

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            fetchChatHistory(); // Fetch chat history once user is loaded
        }
    }, [user, loading, router]);

    // Auto-scroll to the bottom of the chat window on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Function to fetch chat history for the user
    const fetchChatHistory = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chatbot/history`);
            setMessages(res.data);
        } catch (err) {
            console.error('Error fetching chat history:', err.response?.data?.msg || err.message);
            // TODO: Show error to user
        }
    };

    // Function to handle sending a message to the chatbot
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return; // Prevent sending empty messages

        const userMessage = {
            message: input,
            isBot: false,
            timestamp: new Date().toISOString(), // Use ISO string for consistent date handling
        };

        // Optimistically add user message to UI for immediate feedback
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput(''); // Clear input field

        try {
            // Send message to backend chatbot API
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chatbot`, { message: userMessage.message });
            // The backend returns both the user's message (with sentiment) and the bot's response
            // Update messages state with the actual data from the server
            // We slice(0, -1) to remove the optimistically added user message, then add the server's version + bot's response
            setMessages(prevMessages => [...prevMessages.slice(0, -1), ...res.data]);
        } catch (err) {
            console.error('Error sending message:', err.response?.data?.msg || err.message);
            // If sending fails, optionally remove the optimistically added message
            setMessages(prevMessages => prevMessages.filter(msg => msg !== userMessage));
            // TODO: Show error to user
        }
    };

    if (loading) return <div className={styles.loading}>Loading chatbot...</div>;
    if (!user) return null; // Redirection handled by useEffect

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Chat with Your Companion Bot 🤖💬</h1>
                <button onClick={() => router.push('/dashboard')} className={styles.backButton}>Back to Dashboard</button>
            </header>

            <main className={styles.main}>
                <div className={styles.chatWindow}>
                    {messages.map((msg, index) => (
                        <div
                            key={index} // Using index as key is okay for static lists, but prefer unique IDs from DB for dynamic lists
                            className={`${styles.message} ${msg.isBot ? styles.botMessage : styles.userMessage}`}
                        >
                            <span className={styles.messageContent}>{msg.message}</span>
                            <span className={styles.messageTime}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                            {!msg.isBot && msg.sentiment && ( // Display sentiment only for user messages
                                <span className={styles.messageSentiment}>
                                    ({msg.sentiment.label} Score: {msg.sentiment.score.toFixed(2)})
                                </span>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* For auto-scrolling */}
                </div>
                <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message here..."
                    />
                    <button type="submit" className={styles.button}>Send</button>
                </form>
            </main>
        </div>
    );
}