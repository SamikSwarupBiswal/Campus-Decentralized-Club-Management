import { CalendarPlus2 } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { PageHeader } from "@/components/page-header";
import { events } from "@/lib/demo-data";

export default function EventsPage() {
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
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </div>
  );
}
