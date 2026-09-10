"use client";

import { CalendarPlus2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EventCard } from "@/components/event-card";
import { PageHeader } from "@/components/page-header";
import { events as fallbackEvents } from "@/lib/demo-data";
import type { ClubEvent } from "@/lib/types";

export default function EventsPage() {
  const [eventList, setEventList] = useState<ClubEvent[]>(fallbackEvents);

  useEffect(() => {
    fetch("/api/events", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.events && Array.isArray(data.events)) {
          setEventList(data.events);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Campus programme"
        title="Events"
        description="Discover club sessions, link events to approved proposals, and create verifiable attendance."
        action={
          <Link href="/admin?tab=events" className="button button-primary button-md">
            <CalendarPlus2 size={17} /> Create event
          </Link>
        }
      />
      <section className="event-grid">
        {eventList.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </div>
  );
}
