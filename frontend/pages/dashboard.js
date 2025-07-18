import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [chartData, setChartData] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            fetchSentimentData();
        }
    }, [user, loading, router]);

    const fetchSentimentData = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/journals`);
            const entries = res.data;

            const dailySentiments = {};

            entries.forEach(entry => {
                const date = new Date(entry.date).toLocaleDateString();
                const sentimentScore = entry.sentiment?.score || 0;

                if (!dailySentiments[date]) {
                    dailySentiments[date] = { totalScore: 0, count: 0 };
                }
                dailySentiments[date].totalScore += sentimentScore;
                dailySentiments[date].count += 1;
            });

            const labels = Object.keys(dailySentiments).sort((a, b) => {
                return new Date(a) - new Date(b);
            });

            const dataPoints = labels.map(date => {
                const daily = dailySentiments[date];
                return daily.totalScore / daily.count;
            });

            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: 'Average Daily Sentiment',
                        data: dataPoints,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1,
                        fill: true,
                    },
                ],
            });

            setChartOptions({
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Your Average Daily Sentiment Over Time',
                        font: {
                            size: 18, // Adjust chart title font size
                            weight: 'bold'
                        },
                        color: '#333' // Chart title color
                    },
                },
                scales: {
                    y: {
                        min: -1,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Sentiment Score (-1: Negative, 1: Positive)',
                            font: {
                                size: 14
                            },
                            color: '#555'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)' // Lighter grid lines
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                },
            });

        } catch (err) {
            console.error('Error fetching journal sentiment data:', err.response?.data?.msg || err.message);
        }
    };


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 bg-gradient-to-br from-blue-50 to-purple-50">
            Loading dashboard...
        </div>
    );

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <header className="w-full max-w-4xl flex justify-between items-center py-5 border-b border-blue-200 mb-8">
                <h1 className="text-3xl font-bold text-blue-800 m-0">Hello, {user?.username}! 👋</h1>
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors duration-300">
                    Logout
                </button>
            </header>
            <main className="w-full max-w-4xl flex flex-col items-center">
                <p className="text-lg text-gray-600 mb-10 text-center">
                    Welcome to your mental health dashboard. How are you feeling today?
                </p>
                <div className="flex flex-wrap justify-center gap-6 w-full mb-12">
                    <Link href="/journal" className="flex flex-col items-start p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 max-w-sm w-full border border-blue-100">
                        <h2 className="text-2xl font-semibold text-blue-700 mb-2">
                            Journal &rarr;
                        </h2>
                        <p className="text-lg text-gray-700">
                            Express your thoughts and track your mood.
                        </p>
                    </Link>
                    <Link href="/chatbot" className="flex flex-col items-start p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 max-w-sm w-full border border-purple-100">
                        <h2 className="text-2xl font-semibold text-purple-700 mb-2">
                            Chatbot &rarr;
                        </h2>
                        <p className="text-lg text-gray-700">
                            Talk to our AI companion for support.
                        </p>
                    </Link>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-2xl w-full border border-gray-100">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Your Sentiment Trends Over Time 📈</h3>
                    {chartData ? (
                        <Line options={chartOptions} data={chartData} />
                    ) : (
                        <p className="text-gray-500 text-center py-8">No journal entries yet, or data is loading. Start journaling to see your trends!</p>
                    )}
                </div>
            </main>
        </div>
    );
}