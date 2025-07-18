import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Register() {
    const { register, user, loading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { username, email, password, password2 } = formData;

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (password !== password2) {
            alert('Passwords do not match'); // TODO: Replace with a custom modal/toast
            return;
        }

        setIsSubmitting(true);
        try {
            await register({ username, email, password });
        } catch (error) {
            console.error("Registration failed on form submission:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light text-muted">
                Loading...
            </div>
        );
    }

    if (user && !loading) {
        return null;
    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 p-4 bg-light">
            <h1 className="display-5 fw-bold text-purple mb-4 text-center">Register</h1>
            <form onSubmit={onSubmit} className="bg-white p-5 rounded-4 shadow-lg border border-purple-100" style={{ maxWidth: '28rem', width: '100%' }}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label fw-semibold text-dark">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={onChange}
                        required
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold text-dark">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                        minLength="6"
                        className="form-control"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password2" className="form-label fw-semibold text-dark">Confirm Password</label>
                    <input
                        type="password"
                        id="password2"
                        name="password2"
                        value={password2}
                        onChange={onChange}
                        required
                        minLength="6"
                        className="form-control"
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p className="mt-4 text-muted text-center">
                Already have an account? <Link href="/login" className="text-purple fw-bold text-decoration-none">Login</Link>
            </p>
        </div>
    );
}