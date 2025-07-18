import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // For making API calls to your backend
import Cookies from 'js-cookie'; // For managing JWT tokens in browser cookies
import { useRouter } from 'next/router'; // Next.js hook for routing

// Create a new React Context for authentication
const AuthContext = createContext();

// AuthProvider component to wrap your application and provide auth state
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores authenticated user data
    const [loading, setLoading] = useState(true); // Indicates if auth state is being loaded
    const router = useRouter(); // Next.js router instance

    // useEffect to load user data from token on initial load
    useEffect(() => {
        const loadUser = async () => {
            const token = Cookies.get('token'); // Get JWT token from cookies
            if (token) {
                // Set default Authorization header for all Axios requests
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    // Fetch user data from backend using the token
                    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`);
                    setUser(res.data); // Set user state
                } catch (err) {
                    // If token is invalid or expired, clear it
                    console.error('Error loading user:', err.response?.data?.msg || err.message);
                    Cookies.remove('token');
                    delete axios.defaults.headers.common['x-auth-token'];
                }
            }
            setLoading(false); // Set loading to false once user data is checked
        };
        loadUser();
    }, []); // Empty dependency array means this runs once on component mount

    // Function to handle user registration
    const register = async (formData) => {
        try {
            // Post registration data to backend
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, formData);
            // Set token in cookie (expires in 1 day)
            Cookies.set('token', res.data.token, { expires: 1 });
            // Set default Axios header
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
            // Fetch user data after successful registration (to get full user object)
            const userRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`);
            setUser(userRes.data);
            router.push('/dashboard'); // Redirect to dashboard
        } catch (err) {
            console.error('Registration error:', err.response?.data?.msg || err.message);
            // TODO: Implement user-friendly error display (e.g., toast notification)
        }
    };

    // Function to handle user login
    const login = async (formData) => {
        try {
            // Post login data to backend
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, formData);
            // Set token in cookie
            Cookies.set('token', res.data.token, { expires: 1 });
            // Set default Axios header
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
            // Fetch user data after successful login
            const userRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`);
            setUser(userRes.data);
            router.push('/dashboard'); // Redirect to dashboard
        } catch (err) {
            console.error('Login error:', err.response?.data?.msg || err.message);
            // TODO: Implement user-friendly error display
        }
    };

    // Function to handle user logout
    const logout = () => {
        Cookies.remove('token'); // Remove token from cookies
        delete axios.defaults.headers.common['x-auth-token']; // Remove Axios header
        setUser(null); // Clear user state
        router.push('/login'); // Redirect to login page
    };

    // Provide auth state and functions to children components
    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily consume the AuthContext
export const useAuth = () => useContext(AuthContext);