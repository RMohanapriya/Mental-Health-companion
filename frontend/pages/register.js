import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
// Removed: import styles from '../styles/Auth.module.css';

export default function Register() {
    const { register, user, loading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { username, email, password, password2 } = formData;

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
            <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 bg-gradient-to-br from-purple-50 to-blue-50">
                Loading...
            </div>
        );
    }

    // If user is already logged in, redirect to dashboard
    if (user && !loading) {
        // This redirect is handled by useEffect in AuthContext, but a quick check here
        // prevents rendering the form if already authenticated.
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
            <h1 className="text-4xl font-bold text-purple-800 mb-6 text-center drop-shadow-sm">Register</h1>
            <form onSubmit={onSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md flex flex-col gap-5 border border-purple-100">
                <div className="flex flex-col">
                    <label htmlFor="username" className="mb-2 font-semibold text-gray-700">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={onChange}
                        required
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="email" className="mb-2 font-semibold text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
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
                        minLength="6"
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="password2" className="mb-2 font-semibold text-gray-700">Confirm Password</label>
                    <input
                        type="password"
                        id="password2"
                        name="password2"
                        value={password2}
                        onChange={onChange}
                        required
                        minLength="6"
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                    />
                </div>
                <button type="submit" className="bg-purple-600 text-white p-3 rounded-lg text-lg font-bold hover:bg-purple-700 transition-colors duration-300 shadow-md hover:shadow-lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p className="mt-5 text-gray-600 text-center">
                Already have an account? <Link href="/login" className="text-purple-700 font-bold hover:underline">Login</Link>
            </p>
        </div>
    );
}