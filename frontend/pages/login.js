import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
// Removed: import styles from '../styles/Auth.module.css';

export default function Login() {
    const { login, user, loading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { email, password } = formData;

    // Redirect to dashboard if already logged in and not loading
    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await login({ email, password });
        } catch (error) {
            console.error("Login failed on form submission:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 bg-gradient-to-br from-purple-50 to-blue-50">
                Loading...
            </div>
        );
    }

    // If user is already logged in, redirect to dashboard
    if (user && !loading) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
            <h1 className="text-4xl font-bold text-blue-800 mb-6 text-center drop-shadow-sm">Login</h1>
            <form onSubmit={onSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md flex flex-col gap-5 border border-blue-100">
                <div className="flex flex-col">
                    <label htmlFor="email" className="mb-2 font-semibold text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="password" className="mb-2 font-semibold text-gray-700">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                </div>
                <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging In...' : 'Login'}
                </button>
            </form>
            <p className="mt-5 text-gray-600 text-center">
                Don&apos;t have an account? <Link href="/register" className="text-blue-700 font-bold hover:underline">Register</Link>
            </p>
        </div>
    );
}