import {
  CheckCircle2,
  CircleAlert,
  Database,
  ExternalLink,
  Globe2,
  Network,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge, Card } from "@/components/ui";
import { contractAddresses } from "@/lib/contracts";
import { shortAddress } from "@/lib/utils";
import { getSession } from "@/lib/server/session";
import { SettingsSignOut } from "@/components/settings-sign-out";

const contracts = [
  ["Membership registry", contractAddresses.membership],
  ["Campus governor", contractAddresses.governor],
  ["Treasury", contractAddresses.treasury],
  ["Attendance registry", contractAddresses.attendance],
] as const;

export default async function SettingsPage() {
  const session = await getSession();
  const configured = contracts.filter(([, value]) => value).length;
  return (
    <div className="page">
      <PageHeader
        eyebrow="Runtime configuration"
        title="Settings"
        description="Public network configuration and deployment readiness. Secrets are never rendered in the browser."
      />
      <section className="settings-grid">
        {session && <Card className="content-card settings-card">
          <div className="section-heading"><div><span className="section-kicker">Your account</span><h2>Signed-in session</h2></div></div>
          <p>Signed in as <span className="mono">{shortAddress(session.address)}</span>.</p>
          <p>Sign out of this browser and disconnect your wallet.</p>
          <SettingsSignOut />
        </Card>}
        <Card className="content-card settings-card">
          <div className="section-heading"><div><span className="section-kicker">Blockchain</span><h2>Polygon Amoy</h2></div><Network size={20} /></div>
          <div className="info-row"><span>Chain ID</span><strong className="mono">80002</strong></div>
          <div className="info-row"><span>RPC provider</span><strong>{process.env.NEXT_PUBLIC_RPC_URL ? "Environment configured" : "Public fallback"}</strong></div>
          <div className="info-row"><span>Native test token</span><strong>POL</strong></div>
          <a href="https://amoy.polygonscan.com" target="_blank" rel="noreferrer" className="text-link">Open explorer <ExternalLink size={14} /></a>
        </Card>
        <Card className="content-card settings-card">
          <div className="section-heading"><div><span className="section-kicker">Database</span><h2>MongoDB Atlas</h2></div><Database size={20} /></div>
          <div className="settings-status">
            {process.env.MONGODB_URI ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
            <span><strong>{process.env.MONGODB_URI ? "Connected by environment" : "Demo mode"}</strong><small>{process.env.MONGODB_URI ? "Credentials remain server-only." : "Add MONGODB_URI for persistent data."}</small></span>
          </div>
        </Card>
        <Card className="content-card settings-card">
          <div className="section-heading"><div><span className="section-kicker">Hosting</span><h2>Netlify ready</h2></div><Globe2 size={20} /></div>
          <div className="settings-status"><CheckCircle2 size={18} /><span><strong>Build configuration detected</strong><small>Next.js runtime plugin and security headers included.</small></span></div>
        </Card>
        <Card className="content-card settings-card">
          <div className="section-heading"><div><span className="section-kicker">Security</span><h2>Secret isolation</h2></div><ShieldCheck size={20} /></div>
          <div className="settings-status"><CheckCircle2 size={18} /><span><strong>Server-only deployment key</strong><small>No private key uses a NEXT_PUBLIC_ variable.</small></span></div>
        </Card>
      </section>
      <Card className="content-card contracts-card">
        <div className="section-heading">
          <div><span className="section-kicker">Smart contracts</span><h2>Deployment addresses</h2></div>
          <Badge tone={configured === 4 ? "positive" : "warning"}>{configured}/4 configured</Badge>
        </div>
        <div className="contract-list">
          {contracts.map(([name, value]) => (
            <div key={name}>
              <ServerCog size={16} />
              <span><strong>{name}</strong><small className="mono">{value ? shortAddress(value, 10, 8) : "Awaiting deployment"}</small></span>
              {value ? <CheckCircle2 size={16} className="configured" /> : <CircleAlert size={16} className="unconfigured" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
