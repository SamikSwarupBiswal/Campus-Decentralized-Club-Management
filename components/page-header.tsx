import Link from "next/link";
import { WalletButton } from "./wallet-button";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <div className="desktop-topbar" data-od-id="top-bar">
        <Link href="/dashboard" style={{ marginRight: "auto", color: "var(--muted)" }}>Campus DAO / Workspace</Link>
        <WalletButton />
      </div>
      <div className="page-heading">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {action && <div className="page-action">{action}</div>}
      </div>
    </>
  );
}
