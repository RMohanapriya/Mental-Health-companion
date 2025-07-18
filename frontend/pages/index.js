import Link from 'next/link';

export default function Home() {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 p-4 bg-light">
            <main className="text-center py-5">
                <h1 className="display-4 fw-bold text-dark mb-4">
                    Welcome to Your Mental Health Companion <span role="img" aria-label="brain">🧠</span><span role="img" aria-label="sparkles">✨</span>
                </h1>
                <p className="lead text-muted mb-5">
                    Journal your thoughts and chat with our supportive AI.
                </p>
                <div className="d-flex flex-wrap justify-content-center gap-4">
                    <Link href="/register" className="card shadow-lg border-0 rounded-4 p-4 text-start text-decoration-none" style={{ maxWidth: '22rem', width: '100%' }}>
                        <div className="card-body">
                            <h2 className="card-title h4 fw-bold text-primary mb-2">
                                Register &rarr;
                            </h2>
                            <p className="card-text text-muted">
                                Create your account to start your journey.
                            </p>
                        </div>
                    </Link>
                    <Link href="/login" className="card shadow-lg border-0 rounded-4 p-4 text-start text-decoration-none" style={{ maxWidth: '22rem', width: '100%' }}>
                        <div className="card-body">
                            <h2 className="card-title h4 fw-bold text-success mb-2">
                                Login &rarr;
                            </h2>
                            <p className="card-text text-muted">
                                Access your existing journal and chat.
                            </p>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}