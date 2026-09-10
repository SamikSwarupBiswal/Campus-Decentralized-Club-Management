"use client";

import {
  CalendarDays,
  FileCheck2,
  Fingerprint,
  Gauge,
  Menu,
  QrCode,
  Settings2,
  ShieldCheck,
  Users,
  Vault,
  Vote,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WalletButton } from "./wallet-button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Gauge },
  { href: "/proposals", label: "Proposals", icon: Vote },
  { href: "/treasury", label: "Treasury", icon: Vault },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/attendance", label: "Attendance", icon: QrCode },
  { href: "/members", label: "Members", icon: Users },
];

const adminItems = [
  { href: "/admin", label: "Admin console", icon: ShieldCheck },
  { href: "/admin/integrity", label: "Integrity proofs", icon: Fingerprint },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function active(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const navigation = (
    <>
      <div className="brand">
        <div className="brand-mark">
          <span />
          <span />
          <span />
        </div>
        <div>
          <strong>Campus DAO</strong>
          <span>Engineering Collective</span>
        </div>
      </div>

      <nav aria-label="Primary navigation">
        <span className="nav-label">Workspace</span>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("nav-item", active(item.href) && "active")}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon size={18} strokeWidth={1.8} />
            <span>{item.label}</span>
          </Link>
        ))}
        <span className="nav-label nav-label-spaced">Management</span>
        {adminItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("nav-item", active(item.href) && "active")}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon size={18} strokeWidth={1.8} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-status">
        <div className="sidebar-status-top">
          <span className="live-dot" />
          <strong>Polygon Amoy</strong>
          <span>80002</span>
        </div>
        <p>Club governance, powered by your collective.</p>
        <div>
          <FileCheck2 size={14} />
          <span>Testnet only · No real funds</span>
        </div>
      </div>
      <Link href="/settings" className="sidebar-settings">
        <Settings2 size={17} />
        <span>Settings & configuration</span>
      </Link>
    </>
  );

  if (pathname === "/" || pathname === "/login") return <>{children}</>;

  return (
    <div className="app-shell">
      <aside className="sidebar" data-od-id="primary-sidebar">
        {navigation}
      </aside>

      <header className="mobile-header">
        <button
          className="icon-button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <Link href="/" className="mobile-brand">
          <div className="brand-mark small">
            <span />
            <span />
            <span />
          </div>
          <strong>Campus DAO</strong>
        </Link>
        <WalletButton compact />
      </header>

      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <aside
            className="mobile-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="drawer-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
            {navigation}
          </aside>
        </div>
      )}

      <main className="main-canvas" data-od-id="main-content">
        <div className="preview-banner">Preview data is shown on club pages. Wallet sign-in uses a real signature; on-chain actions require configured Amoy contracts.</div>
        {children}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(active(item.href) && "active")}
          >
            <item.icon size={19} />
            <span>{item.label === "Attendance" ? "Attend" : item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
