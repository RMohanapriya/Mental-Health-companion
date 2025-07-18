import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Head from 'next/head'; // Import Head component

function MyApp({ Component, pageProps }) {
    return (
        <AuthProvider>
            <Head>
                {/* Bootstrap CSS */}
                <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                    rel="stylesheet"
                    integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
                    crossOrigin="anonymous"
                />
                {/* Bootstrap JS (optional, for interactive components like dropdowns, modals) */}
                <script
                    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
                    integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
                    crossOrigin="anonymous"
                ></script>
                {/* Inter font for a modern look */}
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>
            <Component {...pageProps} />
        </AuthProvider>
    );
}

export default MyApp;