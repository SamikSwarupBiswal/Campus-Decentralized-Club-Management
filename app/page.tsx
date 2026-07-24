import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  QrCode,
  ShieldCheck,
  Users2,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge, Card } from "@/components/ui";
import { activity, events, proposals } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const activeProposal = proposals[0];
  const nextEvent = events[0];

  return (
    <div className="page dashboard-page">
      <PageHeader
        eyebrow="Thursday, 24 July"
        title="Good afternoon, Ananya."
        description="Here’s what your collective is deciding, building, and verifying."
        action={
          <Link className="button button-primary button-md" href="/proposals/new">
            <Vote size={17} />
            Create proposal
          </Link>
        }
      />

      <section className="stats-grid" data-od-id="governance-kpis">
        <StatCard
          label="Treasury balance"
          value="0.74 POL"
          trend="+0.14"
          hint="since last month"
          icon={CircleDollarSign}
        />
        <StatCard
          label="Active proposals"
          value="02"
          trend="67%"
          hint="average turnout"
          icon={Vote}
        />
        <StatCard
          label="Verified members"
          value="168"
          trend="+12"
          hint="this semester"
          icon={Users2}
        />
        <StatCard
          label="On-chain proofs"
          value="24"
          trend="100%"
          hint="integrity verified"
          icon={ShieldCheck}
        />
      </section>

      <section className="dashboard-primary-grid">
        <Card className="participation-card" data-od-id="participation-chart">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Governance pulse</span>
              <h2>Member participation</h2>
            </div>
            <select aria-label="Chart period" defaultValue="6m">
              <option value="6m">Last 6 months</option>
              <option value="3m">Last 3 months</option>
              <option value="1m">This month</option>
            </select>
          </div>
          <div className="chart-summary">
            <strong>71.8%</strong>
            <span>
              <span className="trend-up">↗ 8.4%</span> from the previous period
            </span>
          </div>
          <div className="participation-chart">
            <svg
              viewBox="0 0 720 238"
              role="img"
              aria-label="Member participation rose from 52 to 72 percent over six months"
            >
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d7f36b" stopOpacity=".45" />
                  <stop offset="100%" stopColor="#d7f36b" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[30, 78, 126, 174, 222].map((y) => (
                <line
                  key={y}
                  x1="24"
                  x2="700"
                  y1={y}
                  y2={y}
                  stroke="#e7eae6"
                  strokeDasharray="3 7"
                />
              ))}
              <path
                d="M26 184 C90 171, 126 151, 162 156 S248 132, 296 142 S382 102, 430 112 S526 62, 568 78 S650 46, 700 54 L700 224 L26 224 Z"
                fill="url(#area)"
              />
              <path
                d="M26 184 C90 171, 126 151, 162 156 S248 132, 296 142 S382 102, 430 112 S526 62, 568 78 S650 46, 700 54"
                fill="none"
                stroke="#173f35"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {[
                [26, 184],
                [162, 156],
                [296, 142],
                [430, 112],
                [568, 78],
                [700, 54],
              ].map(([x, y]) => (
                <g key={x}>
                  <circle cx={x} cy={y} r="7" fill="#fff" stroke="#173f35" strokeWidth="3" />
                </g>
              ))}
              <g fill="#7c8582" fontSize="12" fontFamily="Manrope">
                <text x="17" y="237">Feb</text>
                <text x="150" y="237">Mar</text>
                <text x="286" y="237">Apr</text>
                <text x="420" y="237">May</text>
                <text x="555" y="237">Jun</text>
                <text x="681" y="237">Jul</text>
              </g>
            </svg>
          </div>
          <div className="chart-footnote">
            <CheckCircle2 size={15} />
            Turnout has exceeded the 30% quorum requirement for 8 consecutive proposals.
          </div>
        </Card>

        <Card className="next-event-card" data-od-id="next-event">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Up next</span>
              <h2>Upcoming event</h2>
            </div>
            <CalendarDays size={20} />
          </div>
          <div className="event-date-block">
            <span>JUL</span>
            <strong>26</strong>
          </div>
          <h3>{nextEvent.name}</h3>
          <p>{nextEvent.description}</p>
          <div className="event-details">
            <span>
              <Clock3 size={15} /> {nextEvent.startTime}–{nextEvent.endTime}
            </span>
            <span>
              <QrCode size={15} /> Attendance QR enabled
            </span>
          </div>
          <div className="event-venue">
            <span>Venue</span>
            <strong>{nextEvent.venue}</strong>
          </div>
          <Link href={`/events/${nextEvent.id}`} className="text-link">
            View event details <ArrowRight size={15} />
          </Link>
        </Card>
      </section>

      <section className="dashboard-secondary-grid">
        <Card className="active-proposal-card" data-od-id="active-proposal">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Needs your vote</span>
              <h2>Active proposal</h2>
            </div>
            <Badge tone="accent">Voting open</Badge>
          </div>
          <div className="proposal-feature">
            <div className="proposal-feature-number">#{activeProposal.onchainId}</div>
            <div>
              <span className="proposal-category">{activeProposal.category}</span>
              <h3>{activeProposal.title}</h3>
              <p>{activeProposal.summary}</p>
            </div>
          </div>
          <div className="proposal-progress-head">
            <span>Current votes</span>
            <strong>113 of 168 members</strong>
          </div>
          <div className="vote-bar large">
            <span className="vote-yes" style={{ width: "76%" }} />
            <span className="vote-no" style={{ width: "16%" }} />
            <span className="vote-abstain" style={{ width: "8%" }} />
          </div>
          <div className="vote-legend">
            <span><i className="yes" /> Yes <strong>86</strong></span>
            <span><i className="no" /> No <strong>18</strong></span>
            <span><i className="abstain" /> Abstain <strong>9</strong></span>
          </div>
          <div className="proposal-feature-footer">
            <span><Clock3 size={15} /> 3d 6h remaining</span>
            <Link href={`/proposals/${activeProposal.id}`}>
              Review & vote <ArrowRight size={15} />
            </Link>
          </div>
        </Card>

        <Card className="activity-card" data-od-id="recent-activity">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Live ledger</span>
              <h2>Recent activity</h2>
            </div>
            <span className="live-label"><span className="live-dot" /> Live</span>
          </div>
          <div className="activity-list">
            {activity.map((item, index) => (
              <div className="activity-item" key={item.title}>
                <div className={`activity-icon activity-${item.type}`}>
                  {item.type === "vote" && <Vote size={16} />}
                  {item.type === "attendance" && <QrCode size={16} />}
                  {item.type === "member" && <Users2 size={16} />}
                  {item.type === "treasury" && <CircleDollarSign size={16} />}
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                </div>
                {index === 0 && <span className="new-badge">NEW</span>}
              </div>
            ))}
          </div>
          <Link href="/proposals" className="text-link">
            View complete activity <ArrowRight size={15} />
          </Link>
        </Card>
      </section>

      <footer className="dashboard-footer">
        <span>Campus DAO · Polygon Amoy testnet</span>
        <span>Last synchronized {formatDate("2026-07-24T12:20:00.000Z", { hour: "numeric", minute: "2-digit" })}</span>
      </footer>
    </div>
  );
}
