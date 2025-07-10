import React from "react";

const LoadingSpinner: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-4"></div>
    {message && <div className="text-muted-foreground text-lg">{message}</div>}
  </div>
);

export default LoadingSpinner; 