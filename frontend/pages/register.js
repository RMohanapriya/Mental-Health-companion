import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import Link from 'next/link';
import styles from '../styles/Auth.module.css'; // Import CSS module for styling (we'll create this)

export default function Register() {
    const { register } = useAuth(); // Get the register function from auth context
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '' // For password confirmation
    });

    // Destructure form data
    const { username, email, password, password2 } = formData;

    // Handle input changes
    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Handle form submission
    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            alert('Passwords do not match'); // TODO: Replace with a custom modal/toast
        } else {
            await register({ username, email, password }); // Call register function from context
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Register</h1>
            <form onSubmit={onSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={onChange}
                        required
                    />
                </div>
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
                        minLength="6" // Example minimum length
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password2">Confirm Password</label>
                    <input
                        type="password"
                        id="password2"
                        name="password2"
                        value={password2}
                        onChange={onChange}
                        required
                        minLength="6"
                    />
                </div>
                <button type="submit" className={styles.button}>Register</button>
            </form>
            <p className={styles.text}>
                Already have an account? <Link href="/login">Login</Link>
            </p>
        </div>
    );
}