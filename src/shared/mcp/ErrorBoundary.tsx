/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 * 
 * MCP Error Boundary
 * Professional error handling component with retry functionality
 * Supports i18n and customizable fallbacks
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/components/ui/empty";
import { RiErrorWarningLine, RiRefreshLine, RiAlertLine } from "@remixicon/react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (props: { error: Error; retry: () => void }) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          retry: this.handleRetry,
        });
      }

      // Use Empty component for better consistency with app design
      return <ErrorFallbackContent error={this.state.error} onRetry={this.handleRetry} showDetails={this.props.showDetails} />;
    }

    return this.props.children;
  }
}

/**
 * Error fallback content component with i18n support
 */
function ErrorFallbackContent({
  error,
  onRetry,
  showDetails,
}: {
  error: Error;
  onRetry: () => void;
  showDetails?: boolean;
}) {
  const { t } = useTranslation("common");

  if (showDetails) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <RiAlertLine className="h-5 w-5 text-destructive" />
            <CardTitle>{t("errors.unexpected")}</CardTitle>
          </div>
          <CardDescription>
            {error.message || t("errors.unexpected")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">Error details:</p>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onRetry} variant="outline">
            <RiRefreshLine className="mr-2 h-4 w-4" />
            {t("actions.retry")}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Default: Use Empty component for consistency
  return (
    <Empty className="min-h-[400px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiErrorWarningLine className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>{t("errors.unexpected")}</EmptyTitle>
        <EmptyDescription>
          {error?.message || t("errors.unexpected")}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onRetry} variant="outline">
          <RiRefreshLine className="mr-2 h-4 w-4" />
          {t("actions.retry")}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
