import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'; // Import useState
import Link from 'next/link';
import styles from '../styles/Dashboard.module.css';
import axios from 'axios'; // Import axios to fetch journal data

// Import Chart.js components
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
import { Line } from 'react-chartjs-2'; // Import Line chart component

// Register Chart.js components
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
    const [chartData, setChartData] = useState(null); // State to store data for the chart
    const [chartOptions, setChartOptions] = useState(null); // State to store chart options

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            fetchSentimentData(); // Fetch sentiment data when user is loaded
        }
    }, [user, loading, router]);

    const fetchSentimentData = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/journals`);
            const entries = res.data;

            // Process data for the chart
            // We want to group by date and calculate average sentiment for each day
            const dailySentiments = {};

            entries.forEach(entry => {
                const date = new Date(entry.date).toLocaleDateString(); // Get date string
                const sentimentScore = entry.sentiment?.score || 0; // Default to 0 if no score

                if (!dailySentiments[date]) {
                    dailySentiments[date] = { totalScore: 0, count: 0 };
                }
                dailySentiments[date].totalScore += sentimentScore;
                dailySentiments[date].count += 1;
            });

            // Calculate average and sort by date
            const labels = Object.keys(dailySentiments).sort((a, b) => {
                return new Date(a) - new Date(b); // Sort dates chronologically
            });

            const dataPoints = labels.map(date => {
                const daily = dailySentiments[date];
                return daily.totalScore / daily.count; // Calculate average
            });

            // Set up chart data
            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: 'Average Daily Sentiment',
                        data: dataPoints,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1, // Smooth lines
                        fill: true,
                    },
                ],
            });

            // Set up chart options
            setChartOptions({
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Your Average Daily Sentiment Over Time',
                    },
                },
                scales: {
                    y: {
                        min: -1,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Sentiment Score (-1: Negative, 1: Positive)',
                        },
                    },
                },
            });

        } catch (err) {
            console.error('Error fetching journal sentiment data:', err.response?.data?.msg || err.message);
            // TODO: Display an error message to the user on the dashboard
        }
    };


    if (loading) return <div className={styles.loading}>Loading dashboard...</div>;
    if (!user) return null;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Hello, {user?.username}! 👋</h1>
                <button onClick={logout} className={styles.logoutButton}>Logout</button>
            </header>
            <main className={styles.main}>
                <p className={styles.welcomeText}>Welcome to your mental health dashboard. How are you feeling today?</p>
                <div className={styles.grid}>
                    <Link href="/journal" className={styles.card}>
                        <h2>Journal &rarr;</h2>
                        <p>Express your thoughts and track your mood.</p>
                    </Link>
                    <Link href="/chatbot" className={styles.card}>
                        <h2>Chatbot &rarr;</h2>
                        <p>Talk to our AI companion for support.</p>
                    </Link>
                </div>
                {/* Sentiment trends chart */}
                <div className={styles.chartContainer}>
                    <h3>Your Sentiment Trends Over Time 📈</h3>
                    {chartData ? (
                        <Line options={chartOptions} data={chartData} />
                    ) : (
                        <p>No journal entries yet, or data is loading. Start journaling to see your trends!</p>
                    )}
                </div>
            </main>
        </div>
    );
}