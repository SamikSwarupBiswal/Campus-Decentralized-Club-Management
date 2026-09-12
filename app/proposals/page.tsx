"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { ProposalCard } from "@/components/proposal-card";
import { proposals as initialProposals } from "@/lib/demo-data";
import type { Proposal } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters = ["All", "Active", "Passed", "Executed", "Defeated"] as const;

export default function ProposalsPage() {
  const [proposalsList, setProposalsList] = useState<Proposal[]>(initialProposals);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/proposals")
      .then((res) => res.json())
      .then((data) => {
        if (data.proposals && Array.isArray(data.proposals)) {
          setProposalsList(data.proposals);
        }
      })
      .catch((err) => console.error("Failed to load proposals:", err));
  }, []);

  const filtered = useMemo(
    () =>
      proposalsList.filter((proposal) => {
        const matchesFilter = filter === "All" || proposal.state === filter;
        const matchesQuery =
          !query ||
          proposal.title.toLowerCase().includes(query.toLowerCase()) ||
          proposal.category.toLowerCase().includes(query.toLowerCase());
        return matchesFilter && matchesQuery;
      }),
    [proposalsList, filter, query],
  );

  return (
    <div className="page">
      <PageHeader
        eyebrow="On-chain governance"
        title="Proposals"
        description="Every proposal, vote, and outcome is independently verifiable on Ethereum Sepolia."
        action={
          <Link className="button button-primary button-md" href="/proposals/new">
            <Plus size={17} /> New proposal
          </Link>
        }
      />
      <div className="toolbar">
        <div className="segmented">
          {filters.map((item) => (
            <button
              key={item}
              className={cn(filter === item && "active")}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="filter-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search proposals"
          />
        </label>
      </div>
      <section className="proposal-grid">
        {filtered.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </section>
      {!filtered.length && (
        <div className="card empty-state">
          <div>
            <div className="empty-state-icon">
              <Search size={23} />
            </div>
            <h3>No matching proposals</h3>
            <p>Try another status or a broader search phrase.</p>
          </div>
        </div>
      )}
    </div>
  );
}
