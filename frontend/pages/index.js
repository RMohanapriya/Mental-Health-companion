import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-gradient-to-br from-emerald-50 to-blue-100">
            <main className="flex flex-col justify-center items-center text-center max-w-4xl w-full py-20">
                <h1 className="text-5xl font-extrabold text-gray-800 leading-tight mb-4 drop-shadow-md">
                    Welcome to Your Mental Health Companion <span role="img" aria-label="brain">🧠</span><span role="img" aria-label="sparkles">✨</span>
                </h1>
                <p className="text-xl text-gray-600 mb-10">
                    Journal your thoughts and chat with our supportive AI.
                </p>
                <div className="flex flex-wrap justify-center gap-6 w-full">
                    <Link href="/register" className="flex flex-col items-start p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 max-w-sm w-full border border-gray-100">
                        <h2 className="text-2xl font-semibold text-blue-700 mb-2">
                            Register &rarr;
                        </h2>
                        <p className="text-lg text-gray-700">
                            Create your account to start your journey.
                        </p>
                    </Link>
                    <Link href="/login" className="flex flex-col items-start p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 max-w-sm w-full border border-gray-100">
                        <h2 className="text-2xl font-semibold text-green-700 mb-2">
                            Login &rarr;
                        </h2>
                        <p className="text-lg text-gray-700">
                            Access your existing journal and chat.
                        </p>
                    </Link>
                </div>
            </main>
        </div>
    );
}