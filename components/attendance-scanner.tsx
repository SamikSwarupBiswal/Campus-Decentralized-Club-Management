"use client";

import {
  Camera,
  CheckCircle2,
  Clock,
  Keyboard,
  LoaderCircle,
  RefreshCw,
  ScanLine,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { shortAddress } from "@/lib/utils";
import { Badge, Button } from "./ui";

export interface Attendee {
  wallet: string;
  checkedInAt: string;
  name?: string;
  studentId?: string;
  department?: string;
  year?: string;
  role?: string;
}

type ScanResult =
  | { ok: true; wallet: string; eventId: string; name?: string }
  | { ok: false; error: string };

interface AttendanceScannerProps {
  initialEventId?: string;
}

export function AttendanceScanner({ initialEventId }: AttendanceScannerProps) {
  const [camera, setCamera] = useState(false);
  const [payload, setPayload] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ScanResult>();
  const [activeEventId, setActiveEventId] = useState<string>(initialEventId || "");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const isStoppingRef = useRef(false);

  const loadAttendees = useCallback(async (eventId: string) => {
    if (!eventId) return;
    setRefreshing(true);
    try {
      const response = await fetch(`/api/attendance/check-in?eventId=${encodeURIComponent(eventId)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.ok && Array.isArray(data.attendees)) {
          setAttendees(data.attendees);
          setActiveEventId(eventId);
        }
      }
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (initialEventId) {
      void loadAttendees(initialEventId);
    }
  }, [initialEventId, loadAttendees]);

  const stopScanner = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore errors during cleanup
      }
      scannerRef.current = null;
    }
    setCamera(false);
  }, []);


  useEffect(() => {
    if (!camera) return;
    let cancelled = false;
    isStoppingRef.current = false;

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;

      const element = document.getElementById("attendance-reader");
      if (!element || cancelled) return;

      const scanner = new Html5Qrcode("attendance-reader", {
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.max(220, Math.floor(minEdge * 0.8));
            return { width: edge, height: edge };
          },
        },
        async (decodedText) => {
          if (isStoppingRef.current) return;
          isStoppingRef.current = true;
          try {
            await scanner.stop();
            scanner.clear();
          } catch {
            // ignore
          }
          scannerRef.current = null;
          if (cancelled) return;

          setCamera(false);
          setPayload(decodedText);
          void verify(decodedText);
        },
        () => undefined,
      );
    }

    void start().catch((error) => {
      if (cancelled) return;
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : "Camera access unavailable",
      });
      setCamera(false);
    });

    return () => {
      cancelled = true;
      if (scannerRef.current && !isStoppingRef.current) {
        isStoppingRef.current = true;
        const current = scannerRef.current;
        scannerRef.current = null;
        current.stop().then(() => current.clear()).catch(() => undefined);
      }
    };
  }, [camera]);

  async function verify(value = payload) {
    if (!value.trim()) return;
    setChecking(true);
    setResult(undefined);
    let scannedEventId = "";
    try {
      const parsed = JSON.parse(value) as Record<string, unknown>;
      const body =
        "e" in parsed || "w" in parsed
          ? {
              eventId: parsed.eventId ?? parsed.e,
              wallet: parsed.wallet ?? parsed.w,
              timestamp: parsed.timestamp ?? parsed.t,
              nonce: parsed.nonce ?? parsed.n,
              signature: parsed.signature ?? parsed.s,
              message: parsed.message ?? parsed.m,
            }
          : parsed;
      scannedEventId = String(body.eventId || "");

      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        wallet?: string;
        eventId?: string;
        attendees?: Attendee[];
        error?: string;
      };

      if (!response.ok || !data.ok || !data.wallet || !data.eventId) {
        if (scannedEventId) {
          void loadAttendees(scannedEventId);
        }
        throw new Error(data.error || "Attendance verification failed");
      }

      if (Array.isArray(data.attendees)) {
        setAttendees(data.attendees);
      }
      if (data.eventId) {
        setActiveEventId(data.eventId);
      }

      const matchedAttendee = data.attendees?.find(
        (a) => a.wallet.toLowerCase() === data.wallet?.toLowerCase(),
      );

      setResult({
        ok: true,
        wallet: data.wallet,
        eventId: data.eventId,
        name: matchedAttendee?.name,
      });
    } catch (error) {
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : "Invalid QR payload",
      });
    } finally {
      setChecking(false);
    }
  }

  function formatTime(iso: string) {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(d);
    } catch {
      return iso;
    }
  }

  return (
    <div className="scanner">
      <div className="scanner-tabs">
        <button
          type="button"
          className={camera ? "active" : ""}
          onClick={() => {
            setResult(undefined);
            setCamera(true);
          }}
        >
          <Camera size={15} /> Camera
        </button>
        <button
          type="button"
          className={!camera ? "active" : ""}
          onClick={() => void stopScanner()}
        >
          <Keyboard size={15} /> Paste payload
        </button>
      </div>

      <div
        className="camera-shell"
        style={{ display: camera ? "block" : "none" }}
      >
        <div id="attendance-reader" />
        <span>
          <ScanLine size={15} /> Point the camera at a student’s QR
        </span>
      </div>

      <div
        className="paste-scanner"
        style={{ display: !camera ? "grid" : "none" }}
      >
        <textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          placeholder='{"eventId":"…","wallet":"0x…","signature":"0x…"}'
          aria-label="Attendance QR payload"
        />
        <Button onClick={() => verify()} disabled={!payload || checking}>
          {checking ? <LoaderCircle size={16} className="spin" /> : <ScanLine size={16} />}
          Verify & check in
        </Button>
      </div>

      {result?.ok && (
        <div className="scan-result success">
          <CheckCircle2 size={20} className="scan-result-icon" />
          <div className="scan-result-content">
            <strong>Attendance verified & recorded!</strong>
            <span>
              {result.name ? `${result.name} (${shortAddress(result.wallet)})` : shortAddress(result.wallet)} checked into {result.eventId}
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="scan-next-button"
            onClick={() => {
              setPayload("");
              setResult(undefined);
              setCamera(true);
            }}
          >
            <Camera size={14} /> Scan next pass
          </Button>
        </div>
      )}

      {result && !result.ok && (
        <div className="scan-result error">
          <XCircle size={20} className="scan-result-icon" />
          <div className="scan-result-content">
            <strong>Check-in rejected</strong>
            <span>{result.error}</span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="scan-next-button"
            onClick={() => {
              setPayload("");
              setResult(undefined);
              setCamera(true);
            }}
          >
            <Camera size={14} /> Retry scan
          </Button>
        </div>
      )}

      <div className="attendees-roster">
        <div className="attendees-header">
          <div className="attendees-title">
            <Users size={16} />
            <h3>Checked-in Attendees</h3>
            <Badge tone="accent">{attendees.length}</Badge>
            {activeEventId && (
              <span className="attendees-event-tag">{activeEventId}</span>
            )}
          </div>
          {activeEventId && (
            <button
              type="button"
              className="refresh-attendees-btn"
              onClick={() => void loadAttendees(activeEventId)}
              disabled={refreshing}
              title="Refresh attendee list"
              aria-label="Refresh attendee list"
            >
              <RefreshCw size={13} className={refreshing ? "spin" : ""} />
            </button>
          )}
        </div>

        {attendees.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Wallet</th>
                <th>Check-in Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((attendee) => (
                <tr key={`${attendee.wallet}-${attendee.checkedInAt}`}>
                  <td className="primary-cell" data-label="Member">
                    <strong>{attendee.name || "Club Member"}</strong>
                    <span>
                      {attendee.studentId
                        ? `${attendee.studentId}${attendee.department ? ` · ${attendee.department}` : ""}`
                        : attendee.department || "Active Member"}
                    </span>
                  </td>
                  <td className="mono" data-label="Wallet">
                    {shortAddress(attendee.wallet)}
                  </td>
                  <td data-label="Check-in Time">
                    <span className="attendee-time">
                      <Clock size={12} />
                      {formatTime(attendee.checkedInAt)}
                    </span>
                  </td>
                  <td data-label="Status">
                    <Badge tone="positive">
                      <UserCheck size={11} /> Present
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="attendees-empty">
            <Users size={24} />
            <p>No attendance recorded yet for this event.</p>
            <span>Point camera at attendee passes to verify and add them to this list.</span>
          </div>
        )}
      </div>
    </div>
  );
}

