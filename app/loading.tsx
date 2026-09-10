import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="page">
      <div className="desktop-topbar">
        <Skeleton className="loading-search" />
      </div>
      <div className="loading-heading">
        <Skeleton className="loading-eyebrow" />
        <Skeleton className="loading-title" />
        <Skeleton className="loading-copy" />
      </div>
      <div className="stats-grid">
        {[0, 1, 2, 3].map((item) => (
          <div className="card loading-card" key={item}>
            <Skeleton className="loading-label" />
            <Skeleton className="loading-value" />
            <Skeleton className="loading-line" />
          </div>
        ))}
      </div>
      <div className="card loading-panel">
        <Skeleton className="loading-label" />
        <Skeleton className="loading-chart" />
      </div>
    </div>
  );
}
