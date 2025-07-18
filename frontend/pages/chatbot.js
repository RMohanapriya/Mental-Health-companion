import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Chatbot() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            fetchChatHistory();
        }
    }, [user, loading, router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchChatHistory = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chatbot/history`);
            setMessages(res.data);
        } catch (err) {
            console.error('Error fetching chat history:', err.response?.data?.msg || err.message);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        setIsSending(true);

        const userMessage = {
            message: input,
            isBot: false,
            timestamp: new Date().toISOString(),
            sentiment: { label: 'Analyzing...', score: 0 }
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput('');

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chatbot`, { message: userMessage.message });
            setMessages(prevMessages => [...prevMessages.filter(msg => msg !== userMessage), ...res.data]);
        } catch (err) {
            console.error('Error sending message:', err.response?.data?.msg || err.message);
            setMessages(prevMessages => prevMessages.filter(msg => msg !== userMessage));
        } finally {
            setIsSending(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light text-muted">
            Loading chatbot...
        </div>
    );
    if (!user) return null;

    return (
        <div className="d-flex flex-column align-items-center min-vh-100 p-4 bg-light">
            <header className="w-100 d-flex justify-content-between align-items-center py-3 border-bottom mb-4" style={{ maxWidth: '700px' }}>
                <h1 className="h3 fw-bold text-dark m-0">Chat with Your Companion Bot 🤖💬</h1>
                <button onClick={() => router.push('/dashboard')} className="btn btn-secondary shadow-sm">
                    Back to Dashboard
                </button>
            </header>

            <main className="w-100 d-flex flex-column flex-grow-1 bg-white rounded-4 shadow-lg border border-light overflow-hidden" style={{ maxWidth: '700px', height: 'calc(100vh - 12rem)' }}>
                <div className="flex-grow-1 p-4 overflow-auto d-flex flex-column gap-3">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`d-flex flex-column p-3 rounded-3 shadow-sm ${msg.isBot ? 'align-self-start bg-light-green text-green' : 'align-self-end bg-light-blue text-blue'}`}
                            style={{ maxWidth: '75%' }}
                        >
                            <span className="text-base mb-1">{msg.message}</span>
                            <span className="text-muted text-sm align-self-end">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                                {!msg.isBot && msg.sentiment && (
                                    <span className="ms-2 fst-italic text-xs">({msg.sentiment.label} Score: {msg.sentiment.score?.toFixed(2) || 'N/A'})</span>
                                )}
                            </span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="d-flex p-3 border-top bg-light">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message here..."
                        className="form-control me-3 rounded-pill"
                        disabled={isSending}
                    />
                    <button type="submit" className="btn btn-primary rounded-pill shadow-sm" disabled={isSending}>
                        {isSending ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </main>
        </div>
    );
}