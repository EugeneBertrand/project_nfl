import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <Card className="bg-destructive/10 border-destructive/20">
      <CardContent className="p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <div>
          <h3 className="font-semibold text-foreground mb-2">Something went wrong</h3>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;