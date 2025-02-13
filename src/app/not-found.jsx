export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center h-screen  text-center p-6">
        <h1 className="text-8xl font-bold text-blue-600 animate-bounce">404</h1>
        <p className="text-xl text-gray-700 mt-4">Oops! Page not found.</p>
        <p className="text-gray-500 mt-2 max-w-sm">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <a
          href="/"
          className="mt-6 px-6 py-3 bg-blue-600  rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition"
        >
          Go Home
        </a>
      </div>
    );
  }