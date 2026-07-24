import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "./ui";

export function StatCard({
  label,
  value,
  hint,
  trend,
  direction = "up",
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  trend?: string;
  direction?: "up" | "down";
  icon: LucideIcon;
}) {
  return (
    <Card className="stat-card">
      <div className="stat-card-top">
        <span>{label}</span>
        <div className="stat-icon">
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>
      <strong>{value}</strong>
      <div className="stat-card-bottom">
        {trend && (
          <span className={direction === "up" ? "trend-up" : "trend-down"}>
            {direction === "up" ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {trend}
          </span>
        )}
        <span>{hint}</span>
      </div>
    </Card>
  );
}
