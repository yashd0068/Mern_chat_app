import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h2 className="text-2xl font-bold dark:text-white mb-4">Something went wrong</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                We encountered an error. Please try refreshing the page.
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Refresh Page
                                </button>
                                <button
                                    onClick={() => this.setState({ hasError: false })}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ml-4"
                                >
                                    Try Again
                                </button>
                            </div>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left">
                                    <h3 className="font-semibold dark:text-white mb-2">Error Details:</h3>
                                    <pre className="text-sm text-red-600 dark:text-red-400 overflow-auto">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;