import React from "react";

const ErrorDisplay: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive text-center my-4">
    <div className="font-semibold mb-2">Error</div>
    <div className="mb-2">{message}</div>
    {onRetry && (
      <button
        className="mt-2 px-4 py-2 bg-destructive text-white rounded hover:bg-destructive/80 transition"
        onClick={onRetry}
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorDisplay; 