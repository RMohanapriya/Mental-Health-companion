import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setMessage('');
        setError('');
        setIsSubmitting(true);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forgotpassword`, { email });
            setMessage(res.data.msg); // "Password reset email sent"
            setEmail(''); // Clear email field
        } catch (err) {
            setError(err.response?.data?.msg || 'Something went wrong. Please try again.');
            console.error('Forgot password error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 p-4 bg-light">
            <h1 className="display-5 fw-bold text-dark mb-4 text-center">Forgot Password?</h1>
            <p className="lead text-muted mb-4 text-center">
                Enter your email address to receive a password reset link.
            </p>
            <form onSubmit={handleSubmit} className="bg-white p-5 rounded-4 shadow-lg border border-light" style={{ maxWidth: '28rem', width: '100%' }}>
                <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold text-dark">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
                {message && <div className="alert alert-success mt-4 text-center">{message}</div>}
                {error && <div className="alert alert-danger mt-4 text-center">{error}</div>}
            </form>
            <p className="mt-4 text-muted text-center">
                Remember your password? <Link href="/login" className="text-primary fw-bold text-decoration-none">Login</Link>
            </p>
        </div>
    );
}