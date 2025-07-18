import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ResetPassword() {
    const router = useRouter();
    const { token } = router.query; // Get the token from the URL
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tokenValid, setTokenValid] = useState(true); // State to check token validity (initially assumed valid)

    // Optional: You might want to add a backend check for token validity on page load
    // For now, we'll rely on the API response during submission.
    useEffect(() => {
        if (!token) {
            // If no token in URL, it's an invalid access
            setTokenValid(false);
            setError('No reset token provided. Please use the link from your email.');
        }
    }, [token]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setIsSubmitting(true);

        try {
            // Send the new password and token to the backend
            const res = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/resetpassword/${token}`, { password });
            setMessage(res.data.msg + ' You can now log in.'); // "Password reset successful"
            setPassword('');
            setConfirmPassword('');
            router.push('/login'); // Redirect to login after successful reset
        } catch (err) {
            setError(err.response?.data?.msg || 'Something went wrong. Please try again.');
            console.error('Reset password error:', err);
            setTokenValid(false); // If error, token might be invalid/expired
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!tokenValid) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 p-4 bg-light">
                <h1 className="display-5 fw-bold text-danger mb-4 text-center">Invalid Link</h1>
                <p className="lead text-muted mb-4 text-center">{error}</p>
                <Link href="/forgotpassword" className="btn btn-primary btn-lg shadow-sm">
                    Request New Reset Link
                </Link>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 p-4 bg-light">
            <h1 className="display-5 fw-bold text-dark mb-4 text-center">Reset Password</h1>
            <p className="lead text-muted mb-4 text-center">
                Enter your new password.
            </p>
            <form onSubmit={handleSubmit} className="bg-white p-5 rounded-4 shadow-lg border border-light" style={{ maxWidth: '28rem', width: '100%' }}>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">New Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="6"
                        className="form-control"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold text-dark">Confirm New Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength="6"
                        className="form-control"
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
                {message && <div className="alert alert-success mt-4 text-center">{message}</div>}
                {error && <div className="alert alert-danger mt-4 text-center">{error}</div>}
            </form>
        </div>
    );
}