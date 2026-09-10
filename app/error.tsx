"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button, Card } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page state-page">
      <Card className="state-card">
        <div className="state-icon error"><AlertTriangle size={27} /></div>
        <span className="section-kicker">Something interrupted the request</span>
        <h1>We couldn’t load this view.</h1>
        <p>
          Your wallet and funds are safe. Retry the request, or check the
          network configuration if the problem continues.
        </p>
        <Button onClick={reset}><RefreshCw size={16} /> Try again</Button>
        {error.digest && <span className="mono">Reference: {error.digest}</span>}
      </Card>
    </div>
  );
}
