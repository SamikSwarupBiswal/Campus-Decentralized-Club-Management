import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  TrendingUp,
  Vault,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge, Card } from "@/components/ui";
import { treasuryTransactions } from "@/lib/demo-data";
import { explorerUrl, formatDate, shortAddress } from "@/lib/utils";

const monthly = [
  { month: "Feb", inflow: 0.12, outflow: 0.04 },
  { month: "Mar", inflow: 0.08, outflow: 0.07 },
  { month: "Apr", inflow: 0.2, outflow: 0.05 },
  { month: "May", inflow: 0.06, outflow: 0.1 },
  { month: "Jun", inflow: 0.14, outflow: 0.1 },
  { month: "Jul", inflow: 0.16, outflow: 0.08 },
];

export default function TreasuryPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Collective assets"
        title="DAO treasury"
        description="Testnet funds are visible to everyone and can move only after a successful governance vote."
      />

      <section className="treasury-hero">
        <Card className="balance-card" style={{ color: "#000000", background: "#ffffff" }}>
          <div className="balance-card-head">
            <div className="balance-icon" style={{ color: "#000000", background: "rgba(0,0,0,0.08)" }}><Vault size={21} /></div>
            <Badge tone="positive">Governance controlled</Badge>
          </div>
          <span style={{ color: "#000000", fontWeight: 600 }}>Available balance</span>
          <strong style={{ color: "#000000" }}>0.05 <em style={{ color: "#000000" }}>ETH</em></strong>
          <div className="fiat-disclaimer" style={{ color: "#222222" }}>
            Ethereum Sepolia Test ETH · no monetary value
          </div>
          <div className="balance-stats" style={{ borderTop: "1px solid rgba(0,0,0,0.15)" }}>
            <div><ArrowDownLeft size={16} style={{ color: "#000000" }} /><span style={{ color: "#222222" }}>Total received<strong style={{ color: "#000000" }}>0.05 ETH</strong></span></div>
            <div><ArrowUpRight size={16} style={{ color: "#000000" }} /><span style={{ color: "#222222" }}>Total allocated<strong style={{ color: "#000000" }}>0.00 ETH</strong></span></div>
          </div>
        </Card>

        <Card className="treasury-chart-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Six-month movement</span>
              <h2>Treasury flow</h2>
            </div>
            <div className="chart-key">
              <span><i className="inflow" /> Inflow</span>
              <span><i className="outflow" /> Outflow</span>
            </div>
          </div>
          <div className="bar-chart">
            {monthly.map((item) => (
              <div className="bar-group" key={item.month}>
                <div className="bars">
                  <span className="inflow" style={{ height: `${item.inflow * 410}px` }} />
                  <span className="outflow" style={{ height: `${item.outflow * 410}px` }} />
                </div>
                <small>{item.month}</small>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="treasury-security-grid">
        <div style={{ background: "#ffffff", color: "#000000" }}><LockKeyhole size={17} style={{ color: "#000000", background: "rgba(0,0,0,0.08)" }} /><span style={{ color: "#000000" }}><strong style={{ color: "#000000" }}>No admin withdrawals</strong>Only the governor contract can authorize execution.</span></div>
        <div style={{ background: "#ffffff", color: "#000000" }}><ShieldCheck size={17} style={{ color: "#000000", background: "rgba(0,0,0,0.08)" }} /><span style={{ color: "#000000" }}><strong style={{ color: "#000000" }}>Replay protected</strong>Each approved proposal executes at most once.</span></div>
        <div style={{ background: "#ffffff", color: "#000000" }}><TrendingUp size={17} style={{ color: "#000000", background: "rgba(0,0,0,0.08)" }} /><span style={{ color: "#000000" }}><strong style={{ color: "#000000" }}>Public audit trail</strong>Every transfer remains visible on Ethereum Sepolia.</span></div>
      </section>

      <Card className="content-card transaction-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Immutable ledger</span>
            <h2>Transaction history</h2>
          </div>
          <a
            href={explorerUrl(
              "address",
              process.env.NEXT_PUBLIC_TREASURY_CONTRACT ||
                "0x0000000000000000000000000000000000000000",
            )}
            target="_blank"
            rel="noreferrer"
            className="button button-secondary button-sm"
          >
            Etherscan <ExternalLink size={13} />
          </a>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Proposal</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Explorer</th>
              </tr>
            </thead>
            <tbody>
              {treasuryTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="primary-cell" data-label="Transaction">
                    <strong>{tx.label}</strong>
                    <span>{formatDate(tx.timestamp, { hour: "numeric", minute: "2-digit" })}</span>
                  </td>
                  <td data-label="Proposal">#{tx.proposalId}</td>
                  <td className="mono" data-label="Recipient">{shortAddress(tx.recipient)}</td>
                  <td data-label="Amount"><strong>{tx.amount.replace("POL", "ETH")}</strong></td>
                  <td data-label="Status"><Badge tone="positive">{tx.status}</Badge></td>
                  <td data-label="Explorer">
                    <a className="table-link" href={explorerUrl("tx", tx.txHash)} target="_blank" rel="noreferrer">
                      {tx.txHash.slice(0, 8)}… <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="notice treasury-notice">
        <Landmark size={17} />
        <div>
          <strong>Academic testnet demonstration</strong>
          Campus DAO never handles INR or assets with real-world value. All displayed funds are free Ethereum Sepolia test tokens.
        </div>
      </div>
    </div>
  );
}
