"use client";

import {
  Calendar,
  Clock,
  ExternalLink,
  History,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AttendanceAttendee } from "@/lib/server/attendance";
import { cn, explorerUrl, formatDate, shortAddress } from "@/lib/utils";
import { Badge, Card } from "./ui";

export interface EventSummary {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  organizer: string;
  description: string;
  attendanceStatus: "Open" | "Upcoming" | "Closed" | "Finalized";
  capacity: number;
  attendeesCount: number;
  realRecordedCount?: number;
  canonicalHash?: string;
}

interface EventAttendanceHistoryProps {
  initialEvents?: EventSummary[];
  defaultSelectedEventId?: string;
}

export function EventAttendanceHistory({
  initialEvents = [],
  defaultSelectedEventId,
}: EventAttendanceHistoryProps) {
  const [events, setEvents] = useState<EventSummary[]>(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState<string>(
    defaultSelectedEventId || initialEvents[0]?.id || "",
  );
  const [attendees, setAttendees] = useState<AttendanceAttendee[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(initialEvents.length === 0);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "past" | "active">("all");

  // Load list of all events with attendance counts
  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("/api/attendance/history", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.events)) {
          setEvents(data.events);
          if (!selectedEventId && data.events.length > 0) {
            setSelectedEventId(data.events[0].id);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load events history:", err);
    } finally {
      setLoadingEvents(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (initialEvents.length === 0) {
      void loadEvents();
    }
  }, [initialEvents.length, loadEvents]);

  // Load attendees for the currently selected event
  const loadAttendees = useCallback(async (eventId: string) => {
    if (!eventId) return;
    setLoadingAttendees(true);
    try {
      const res = await fetch(
        `/api/attendance/history?eventId=${encodeURIComponent(eventId)}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.attendees)) {
          setAttendees(data.attendees);
          // Update event stats if returned
          if (data.event) {
            setEvents((prev) =>
              prev.map((e) =>
                e.id === eventId
                  ? {
                      ...e,
                      attendeesCount: data.attendees.length,
                      canonicalHash: data.event.canonicalHash,
                    }
                  : e,
              ),
            );
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load event attendees:", err);
    } finally {
      setLoadingAttendees(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      void loadAttendees(selectedEventId);
    }
  }, [selectedEventId, loadAttendees]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || events[0],
    [events, selectedEventId],
  );

  const filteredEvents = useMemo(() => {
    if (filterTab === "past") {
      return events.filter(
        (e) => e.attendanceStatus === "Finalized" || e.attendanceStatus === "Closed",
      );
    }
    if (filterTab === "active") {
      return events.filter((e) => e.attendanceStatus === "Open");
    }
    return events;
  }, [events, filterTab]);

  const filteredAttendees = useMemo(() => {
    if (!searchQuery.trim()) return attendees;
    const q = searchQuery.toLowerCase().trim();
    return attendees.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.wallet.toLowerCase().includes(q) ||
        a.studentId?.toLowerCase().includes(q) ||
        a.department?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q),
    );
  }, [attendees, searchQuery]);

  function formatTime(iso: string) {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("en-IN", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(d);
    } catch {
      return iso;
    }
  }

  function getStatusTone(status: EventSummary["attendanceStatus"]) {
    switch (status) {
      case "Finalized":
        return "positive";
      case "Open":
        return "accent";
      case "Closed":
        return "neutral";
      case "Upcoming":
        return "warning";
      default:
        return "neutral";
    }
  }

  return (
    <Card className="content-card event-attendance-history-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Attendance registry</span>
          <h2>Event attendance history</h2>
          <p className="section-description">
            Select any previous or active club event to view its complete attendance record and verified member roster.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            className="refresh-attendees-btn"
            onClick={() => {
              void loadEvents();
              if (selectedEventId) void loadAttendees(selectedEventId);
            }}
            disabled={loadingEvents || loadingAttendees}
            title="Refresh records"
            aria-label="Refresh records"
          >
            <RefreshCw
              size={14}
              className={loadingEvents || loadingAttendees ? "spin" : ""}
            />
          </button>
          <History size={20} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="event-history-filter-bar" style={{ display: "flex", gap: "8px", margin: "16px 0 20px" }}>
        <button
          type="button"
          className={cn("button button-sm", filterTab === "all" ? "button-primary" : "button-secondary")}
          onClick={() => setFilterTab("all")}
        >
          All events ({events.length})
        </button>
        <button
          type="button"
          className={cn("button button-sm", filterTab === "past" ? "button-primary" : "button-secondary")}
          onClick={() => setFilterTab("past")}
        >
          Previous events ({events.filter((e) => e.attendanceStatus === "Finalized" || e.attendanceStatus === "Closed").length})
        </button>
        <button
          type="button"
          className={cn("button button-sm", filterTab === "active" ? "button-primary" : "button-secondary")}
          onClick={() => setFilterTab("active")}
        >
          Active check-in ({events.filter((e) => e.attendanceStatus === "Open").length})
        </button>
      </div>

      {/* Event Selection Grid / Cards */}
      <div
        className="event-selector-list"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {filteredEvents.map((ev) => {
          const isSelected = ev.id === selectedEventId;
          return (
            <div
              key={ev.id}
              onClick={() => setSelectedEventId(ev.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedEventId(ev.id);
                }
              }}
              className={cn(
                "event-select-card",
                isSelected && "event-select-card-active",
              )}
              style={{
                cursor: "pointer",
                padding: "16px",
                borderRadius: "12px",
                border: isSelected
                  ? "2px solid var(--accent-primary, #6366f1)"
                  : "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                background: isSelected
                  ? "var(--surface-elevated, rgba(99, 102, 241, 0.08))"
                  : "var(--surface-card, rgba(255,255,255,0.02))",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <Badge tone={getStatusTone(ev.attendanceStatus)}>
                  {ev.attendanceStatus}
                </Badge>
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-secondary)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Users size={12} />
                  <strong>{ev.attendeesCount}</strong> attended
                </span>
              </div>
              <h4 style={{ fontSize: "0.98rem", fontWeight: 700, margin: "0 0 6px" }}>
                {ev.name}
              </h4>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={12} /> {formatDate(ev.date)} ({ev.startTime}–{ev.endTime})
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={12} /> {ev.venue}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Event Attendee Roster */}
      {selectedEvent && (
        <div
          className="selected-event-roster-box"
          style={{
            borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
            paddingTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <span className="section-kicker">Event roster</span>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "2px 0 6px" }}>
                {selectedEvent.name} — Attended Users
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                {selectedEvent.venue} · {formatDate(selectedEvent.date)}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <Badge tone="accent">
                <Users size={12} /> {attendees.length} checked in
              </Badge>
              {selectedEvent.canonicalHash && (
                <span
                  className="integrity-match"
                  style={{
                    fontSize: "0.78rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ShieldCheck size={13} /> On-chain proof verified
                </span>
              )}
            </div>
          </div>

          {/* Search bar inside attendees */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              position: "relative",
            }}
          >
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                color: "var(--text-tertiary, #888)",
              }}
            />
            <input
              type="text"
              placeholder="Search attended members by name, wallet, department, or student ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle, rgba(255,255,255,0.12))",
                background: "var(--surface-input, rgba(0,0,0,0.2))",
                color: "var(--text-primary, #fff)",
                fontSize: "0.88rem",
              }}
            />
          </div>

          {/* Attendees Table or Loading / Empty state */}
          {loadingAttendees ? (
            <div style={{ textAlign: "center", padding: "40px 16px" }}>
              <LoaderCircle size={28} className="spin" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Loading attendee records for {selectedEvent.name}…
              </p>
            </div>
          ) : filteredAttendees.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Attended Member</th>
                  <th>Student ID & Dept</th>
                  <th>Role</th>
                  <th>Wallet Address</th>
                  <th>Check-in Time</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((attendee) => (
                  <tr key={`${attendee.wallet}-${attendee.checkedInAt}`}>
                    <td className="primary-cell" data-label="Member">
                      <strong>{attendee.name || "Club Member"}</strong>
                    </td>
                    <td data-label="Student ID & Dept">
                      <span>
                        {attendee.studentId ? <strong>{attendee.studentId} · </strong> : null}
                        {attendee.department || "Active Member"}
                        {attendee.year ? ` (${attendee.year})` : ""}
                      </span>
                    </td>
                    <td data-label="Role">
                      <Badge tone={attendee.role === "Admin" ? "accent" : "neutral"}>
                        {attendee.role || "Member"}
                      </Badge>
                    </td>
                    <td className="mono" data-label="Wallet">
                      <a
                        href={explorerUrl("address", attendee.wallet)}
                        target="_blank"
                        rel="noreferrer"
                        className="table-link mono"
                        title={attendee.wallet}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        {shortAddress(attendee.wallet)}
                        <ExternalLink size={11} />
                      </a>
                    </td>
                    <td data-label="Check-in Time">
                      <span className="attendee-time" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <Clock size={12} />
                        {formatTime(attendee.checkedInAt)}
                      </span>
                    </td>
                    <td data-label="Attendance Status">
                      <Badge tone="positive">
                        <UserCheck size={11} /> Present · Verified
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="attendees-empty" style={{ padding: "36px 16px", textAlign: "center" }}>
              <Users size={28} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
              <h4 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 6px" }}>
                {searchQuery ? "No matching attendees found" : "No attendance recorded yet"}
              </h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "420px", margin: "0 auto" }}>
                {searchQuery
                  ? "Try searching with a different name, wallet, or student ID."
                  : selectedEvent.attendanceStatus === "Upcoming"
                  ? "Check-in will open during the scheduled event window. Attendance records will appear here as members check in."
                  : "No check-ins were registered for this event session."}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
