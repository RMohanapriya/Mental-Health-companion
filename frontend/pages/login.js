import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import Link from 'next/link';
import styles from '../styles/Auth.module.css'; // Import CSS module for styling

export default function Login() {
    const { login } = useAuth(); // Get the login function from auth context
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Destructure form data
    const { email, password } = formData;

    // Handle input changes
    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Handle form submission
    const onSubmit = async (e) => {
        e.preventDefault();
        await login({ email, password }); // Call login function from context
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Login</h1>
            <form onSubmit={onSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                    />
                </div>
                <button type="submit" className={styles.button}>Login</button>
            </form>
            <p className={styles.text}>
                Don&apos;t have an account? <Link href="/register">Register</Link>
            </p>
        </div>
    );
}