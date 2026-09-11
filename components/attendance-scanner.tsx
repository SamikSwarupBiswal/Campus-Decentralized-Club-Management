"use client";

import {
  Camera,
  CheckCircle2,
  Keyboard,
  LoaderCircle,
  ScanLine,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui";

type ScanResult =
  | { ok: true; wallet: string; eventId: string }
  | { ok: false; error: string };

export function AttendanceScanner() {
  const [camera, setCamera] = useState(false);
  const [payload, setPayload] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ScanResult>();
  const scannerRef = useRef<{ stop: () => Promise<void> } | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!camera) return;
    let cancelled = false;
    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
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
        (decodedText) => {
          setPayload(decodedText);
          void verify(decodedText);
          void scanner.stop();
          setCamera(false);
        },
        () => undefined,
      );
    }
    void start().catch((error) => {
      setResult({ ok: false, error: error instanceof Error ? error.message : "Camera unavailable" });
      setCamera(false);
    });
    return () => {
      cancelled = true;
      void scannerRef.current?.stop().catch(() => undefined);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  async function verify(value = payload) {
    if (!value.trim()) return;
    setChecking(true);
    setResult(undefined);
    try {
      const parsed = JSON.parse(value) as Record<string, unknown>;
      const body = ("e" in parsed || "w" in parsed)
        ? {
            eventId: parsed.eventId ?? parsed.e,
            wallet: parsed.wallet ?? parsed.w,
            timestamp: parsed.timestamp ?? parsed.t,
            nonce: parsed.nonce ?? parsed.n,
            signature: parsed.signature ?? parsed.s,
            message: parsed.message ?? parsed.m,
          }
        : parsed;
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        wallet?: string;
        eventId?: string;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.wallet || !data.eventId) {
        throw new Error(data.error || "Attendance verification failed");
      }
      setResult({ ok: true, wallet: data.wallet, eventId: data.eventId });
    } catch (error) {
      setResult({ ok: false, error: error instanceof Error ? error.message : "Invalid QR payload" });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="scanner">
      <div className="scanner-tabs">
        <button className={camera ? "active" : ""} onClick={() => setCamera(true)}>
          <Camera size={15} /> Camera
        </button>
        <button className={!camera ? "active" : ""} onClick={() => setCamera(false)}>
          <Keyboard size={15} /> Paste payload
        </button>
      </div>
      {camera ? (
        <div className="camera-shell">
          <div id="attendance-reader" />
          <span><ScanLine size={15} /> Point the camera at a student’s QR</span>
        </div>
      ) : (
        <div className="paste-scanner">
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
      )}
      {result?.ok && (
        <div className="scan-result success">
          <CheckCircle2 size={18} />
          <div><strong>Attendance verified</strong><span>{result.wallet.slice(0, 12)}… checked into {result.eventId}</span></div>
        </div>
      )}
      {result && !result.ok && (
        <div className="scan-result error">
          <XCircle size={18} />
          <div><strong>Check-in rejected</strong><span>{result.error}</span></div>
        </div>
      )}
    </div>
  );
}
