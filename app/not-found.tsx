import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="page state-page">
      <Card className="state-card">
        <div className="state-icon"><FileQuestion size={27} /></div>
        <span className="section-kicker">404 · Record not found</span>
        <h1>This governance record doesn’t exist.</h1>
        <p>
          It may have been removed from the off-chain index, or the URL may be
          incomplete. On-chain history remains unchanged.
        </p>
        <Link href="/" className="button button-primary button-md">
          <ArrowLeft size={16} /> Return to overview
        </Link>
      </Card>
    </div>
  );
}
