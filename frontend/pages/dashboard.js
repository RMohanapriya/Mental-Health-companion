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
                        borderColor: 'rgba(75, 192, 192, 1)',
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
                            size: 18,
                            weight: 'bold'
                        },
                        color: '#343a40'
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
                            color: '#6c757d'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
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
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light text-muted">
            Loading dashboard...
        </div>
    );

    if (!user) return null;

    return (
        <div className="d-flex flex-column align-items-center min-vh-100 p-4 bg-light">
            <header className="w-100 d-flex justify-content-between align-items-center py-3 border-bottom mb-4" style={{ maxWidth: '900px' }}>
                <h1 className="h3 fw-bold text-dark m-0">Hello, {user?.username}! 👋</h1>
                <button onClick={logout} className="btn btn-danger shadow-sm">
                    Logout
                </button>
            </header>
            <main className="w-100" style={{ maxWidth: '900px' }}>
                <p className="lead text-muted mb-5 text-center">
                    Welcome to your mental health dashboard. How are you feeling today?
                </p>
                <div className="row g-4 mb-5 justify-content-center">
                    <div className="col-md-6">
                        <Link href="/journal" className="card shadow-lg border-0 rounded-4 p-4 text-start text-decoration-none h-100">
                            <div className="card-body">
                                <h2 className="card-title h4 fw-bold text-primary mb-2">
                                    Journal &rarr;
                                </h2>
                                <p className="card-text text-muted">
                                    Express your thoughts and track your mood.
                                </p>
                            </div>
                        </Link>
                    </div>
                    <div className="col-md-6">
                        <Link href="/chatbot" className="card shadow-lg border-0 rounded-4 p-4 text-start text-decoration-none h-100">
                            <div className="card-body">
                                <h2 className="card-title h4 fw-bold text-success mb-2">
                                    Chatbot &rarr;
                                </h2>
                                <p className="card-text text-muted">
                                    Talk to our AI companion for support.
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-4 shadow-lg border border-light">
                    <h3 className="h4 fw-bold text-dark mb-4 text-center">Your Sentiment Trends Over Time 📈</h3>
                    {chartData ? (
                        <Line options={chartOptions} data={chartData} />
                    ) : (
                        <p className="text-muted text-center py-5">No journal entries yet, or data is loading. Start journaling to see your trends!</p>
                    )}
                </div>
            </main>
        </div>
    );
}