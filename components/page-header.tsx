import { Bell, Search } from "lucide-react";
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
        <div className="search-shell">
          <Search size={16} />
          <input aria-label="Search Campus DAO" placeholder="Search proposals, events, members…" />
          <kbd>⌘ K</kbd>
        </div>
        <button className="notification-button" aria-label="Notifications">
          <Bell size={18} />
          <span />
        </button>
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
