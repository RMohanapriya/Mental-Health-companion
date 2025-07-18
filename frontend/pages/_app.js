import '../styles/globals.css'; // Import your global CSS (we'll create this soon)
import { AuthProvider } from '../context/AuthContext'; // Import your AuthProvider

function MyApp({ Component, pageProps }) {
    return (
        // Wrap the entire application with AuthProvider
        <AuthProvider>
            <Component {...pageProps} />
        </AuthProvider>
    );
}

export default MyApp;