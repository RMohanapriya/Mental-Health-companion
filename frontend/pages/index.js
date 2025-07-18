import Link from 'next/link'; // Next.js component for client-side navigation
import styles from '../styles/Home.module.css'; // Import CSS module for styling (we'll create this)

export default function Home() {
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1 className={styles.title}>
                    Welcome to Your Mental Health Companion 🧠✨
                </h1>
                <p className={styles.description}>
                    Journal your thoughts and chat with our supportive AI.
                </p>
                <div className={styles.grid}>
                    {/* Link to the registration page */}
                    <Link href="/register" className={styles.card}>
                        <h2>Register &rarr;</h2>
                        <p>Create your account to start your journey.</p>
                    </Link>
                    {/* Link to the login page */}
                    <Link href="/login" className={styles.card}>
                        <h2>Login &rarr;</h2>
                        <p>Access your existing journal and chat.</p>
                    </Link>
                </div>
            </main>
        </div>
    );
}