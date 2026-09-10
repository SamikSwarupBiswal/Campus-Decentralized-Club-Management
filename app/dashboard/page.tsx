import Link from "next/link";
import { ArrowUpRight, Vote, Vault, CalendarDays, QrCode, Users, Fingerprint } from "lucide-react";
import { WalletButton } from "@/components/wallet-button";

const areas = [
  { name: "Make your voice count.", label: "Governance", description: "Propose the next big idea. Read the details, weigh in, and vote.", href: "/proposals", icon: Vote },
  { name: "Follow the funds.", label: "Treasury", description: "See how Test POL is allocated through collective decisions.", href: "/treasury", icon: Vault },
  { name: "Find your next thing.", label: "Events", description: "Workshops, meetups, and ideas that bring the club together.", href: "/events", icon: CalendarDays },
  { name: "Show up. Be counted.", label: "Attendance", description: "Sign a short-lived QR with your wallet for a verified check-in.", href: "/attendance", icon: QrCode },
  { name: "Meet the collective.", label: "Members", description: "One member, one voice. Explore the people behind the club.", href: "/members", icon: Users },
  { name: "Trust, with receipts.", label: "Integrity", description: "Explore how an on-chain fingerprint makes changes detectable.", href: "/admin/integrity", icon: Fingerprint },
];

export default function DashboardPage() {
  return <div className="page">
    <div className="workspace-heading"><div className="workspace-intro"><Link className="section-kicker" href="/">Campus DAO / Your workspace</Link><h1>A little less permission.<br />A lot more participation.</h1><p>Your club starts with the people who show up.</p></div><WalletButton /></div>
    <div className="workspace-links">{areas.map(area => <Link key={area.href} href={area.href} className="workspace-link"><area.icon size={25} strokeWidth={1.5} /><div><span className="section-kicker">{area.label}</span><h2>{area.name}</h2><p>{area.description}</p></div><ArrowUpRight className="link-arrow" size={18} /></Link>)}</div>
    <div className="notice" style={{ marginTop: 32 }}><Fingerprint size={20} /><div><strong>Connection is the first step.</strong>Connect MetaMask, switch to Polygon Amoy, then sign a message to log in. Club membership is approved separately by an administrator.</div></div>
  </div>;
}
