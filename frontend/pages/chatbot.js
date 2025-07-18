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
    const [isSending, setIsSending] = useState(false); // New state for sending status

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

        setIsSending(true); // Set sending state to true

        const userMessage = {
            message: input,
            isBot: false,
            timestamp: new Date().toISOString(),
            sentiment: { label: 'Analyzing...', score: 0 } // Optimistic sentiment
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput('');

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chatbot`, { message: userMessage.message });
            setMessages(prevMessages => [...prevMessages.filter(msg => msg !== userMessage), ...res.data]);
        } catch (err) {
            console.error('Error sending message:', err.response?.data?.msg || err.message);
            setMessages(prevMessages => prevMessages.filter(msg => msg !== userMessage)); // Remove optimistic message on error
        } finally {
            setIsSending(false); // Reset sending state
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 bg-gradient-to-br from-green-50 to-blue-50">
            Loading chatbot...
        </div>
    );
    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-blue-50">
            <header className="w-full max-w-2xl flex justify-between items-center py-5 border-b border-green-200 mb-8">
                <h1 className="text-3xl font-bold text-green-800 m-0">Chat with Your Companion Bot 🤖💬</h1>
                <button onClick={() => router.push('/dashboard')} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300">
                    Back to Dashboard
                </button>
            </header>

            <main className="w-full max-w-2xl flex flex-col flex-grow bg-white rounded-xl shadow-2xl border border-green-100 overflow-hidden">
                <div className="flex-grow p-5 overflow-y-auto flex flex-col gap-4" style={{ minHeight: '300px' }}> {/* Added minHeight for chat window */}
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex flex-col max-w-[75%] p-3 rounded-xl shadow-sm ${msg.isBot ? 'self-start bg-green-50 text-green-800 border border-green-100' : 'self-end bg-blue-50 text-blue-800 border border-blue-100'}`}
                        >
                            <span className="text-base mb-1">{msg.message}</span>
                            <span className="text-xs text-gray-500 self-end">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                                {!msg.isBot && msg.sentiment && (
                                    <span className="ml-2 italic">({msg.sentiment.label} Score: {msg.sentiment.score?.toFixed(2) || 'N/A'})</span>
                                )}
                            </span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex p-4 border-t border-gray-200 bg-gray-50">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message here..."
                        className="flex-grow p-3 border border-gray-300 rounded-full mr-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 text-gray-800"
                        disabled={isSending}
                    />
                    <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-full text-lg font-bold hover:bg-green-700 transition-colors duration-300 shadow-md hover:shadow-lg" disabled={isSending}>
                        {isSending ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </main>
        </div>
    );
}