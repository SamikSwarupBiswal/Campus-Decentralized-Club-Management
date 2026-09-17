"use client";

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { Badge, Button, Card } from "./ui";

export function AttendanceQr({ eventId }: { eventId: string }) {
  const { address, isConnected, connector: activeConnector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const [image, setImage] = useState<string>();
  const [expiresAt, setExpiresAt] = useState<number>();
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  // Check if wallet has already recorded attendance for this event
  useEffect(() => {
    let active = true;
    async function checkStatus() {
      if (!address) {
        setAlreadyCheckedIn(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/attendance/challenge?eventId=${encodeURIComponent(eventId)}&wallet=${encodeURIComponent(address)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active && data.checkedIn) {
          setAlreadyCheckedIn(true);
          setImage(undefined);
        }
      } catch {
        // ignore
      }
    }
    void checkStatus();
    return () => {
      active = false;
    };
  }, [eventId, address]);

  // While QR code is active on screen, poll to detect when admin scans it
  useEffect(() => {
    if (!image || alreadyCheckedIn || !address) return;
    const interval = window.setInterval(async () => {
      try {
        const res = await fetch(
          `/api/attendance/challenge?eventId=${encodeURIComponent(eventId)}&wallet=${encodeURIComponent(address)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.checkedIn) {
          setAlreadyCheckedIn(true);
          setImage(undefined);
        }
      } catch {
        // ignore
      }
    }, 2000);
    return () => window.clearInterval(interval);
  }, [image, alreadyCheckedIn, eventId, address]);

  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    }, 250);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  async function generate() {
    setError(undefined);
    let targetAddress = address;
    let targetConnector = activeConnector;

    if (!isConnected || !targetAddress) {
      const isMobile = typeof window !== "undefined" && /android|iphone|ipad|ipod/i.test(navigator.userAgent);
      const hasInjected = typeof window !== "undefined" && Boolean((window as unknown as { ethereum?: unknown }).ethereum);
      if (isMobile && !hasInjected) {
        const dappUrl = window.location.host + window.location.pathname;
        window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
        return;
      }
      const connector = connectors.find(c => c.name.toLowerCase().includes("metamask")) || connectors[0];
      if (connector) {
        try {
          setLoading(true);
          const conn = await connectAsync({ connector });
          targetAddress = conn.accounts[0];
          targetConnector = connector;
        } catch {
          setLoading(false);
          setError("Connect MetaMask before generating your signed attendance code.");
          return;
        }
      } else {
        setError("Connect MetaMask before generating your signed attendance code.");
        return;
      }
    }

    if (!targetAddress) {
      setError("Please connect your wallet first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/attendance/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, wallet: targetAddress }),
      });
      const challenge = (await response.json()) as {
        message?: string;
        nonce?: string;
        timestamp?: number;
        expiresAt?: number;
        error?: string;
        alreadyCheckedIn?: boolean;
      };
      if (response.status === 409 || challenge.alreadyCheckedIn) {
        setAlreadyCheckedIn(true);
        setImage(undefined);
        setError("Attendance is already recorded for this event. Another QR code cannot be generated.");
        return;
      }
      if (!response.ok || !challenge.message || !challenge.expiresAt) {
        throw new Error(challenge.error || "Unable to create challenge");
      }
      const signature = await signMessageAsync({
        message: challenge.message,
        account: targetAddress,
        connector: targetConnector,
      });
      const payload = JSON.stringify({
        eventId,
        wallet: targetAddress,
        timestamp: challenge.timestamp,
        nonce: challenge.nonce,
        signature,
      });
      setImage(
        await QRCode.toDataURL(payload, {
          width: 560,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
          errorCorrectionLevel: "L",
        }),
      );
      setExpiresAt(challenge.expiresAt);
      setRemaining(Math.ceil((challenge.expiresAt - Date.now()) / 1000));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate QR");
    } finally {
      setLoading(false);
    }
  }

  const expired = Boolean(image && remaining <= 0);

  return (
    <Card className="side-card qr-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Your check-in pass</span>
          <h2>{alreadyCheckedIn ? "Attendance verified" : "Signed attendance QR"}</h2>
        </div>
        {alreadyCheckedIn ? <CheckCircle2 size={20} style={{ color: "var(--color-positive, #10b981)" }} /> : <QrCode size={20} />}
      </div>
      {alreadyCheckedIn ? (
        <div className="qr-empty qr-confirmed" style={{ textAlign: "center", padding: "24px 12px" }}>
          <div style={{ color: "var(--color-positive, #10b981)", display: "flex", justifyContent: "center", marginBottom: "14px" }}>
            <CheckCircle2 size={44} />
          </div>
          <Badge tone="positive" style={{ marginBottom: "10px" }}>Attendance Confirmed</Badge>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>
            You are checked in!
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "16px" }}>
            Your attendance pass for this event has been scanned and recorded.
            In accordance with club rules, duplicate QR codes cannot be generated.
          </p>
          <div className="notice" style={{ textAlign: "left", fontSize: "0.82rem" }}>
            <ShieldCheck size={16} />
            <div>
              <strong>Verified Presence</strong>
              Your participation is confirmed and will be included in the finalized on-chain attendance proof.
            </div>
          </div>
        </div>
      ) : image ? (
        <>
          <div className={`qr-image-wrap ${expired ? "expired" : ""}`}>
            {/* qrcode returns a locally generated data URI, not remote content. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Short-lived signed attendance QR code" />
            {expired && <div className="qr-expired">Expired</div>}
          </div>
          <div className="qr-timer">
            <Clock3 size={15} />
            {expired ? (
              <span>This code has expired</span>
            ) : (
              <span>Valid for <strong>{remaining}s</strong></span>
            )}
          </div>
          <Button variant={expired ? "primary" : "secondary"} className="full-button" onClick={generate} disabled={loading}>
            {loading ? <LoaderCircle size={16} className="spin" /> : <RefreshCw size={16} />}
            Generate a new code
          </Button>
        </>
      ) : (
        <div className="qr-empty">
          <div><ShieldCheck size={28} /></div>
          <p>Your wallet signs an event-specific challenge. The QR expires after 60 seconds and can be used only once.</p>
          <Button className="full-button" onClick={generate} disabled={loading}>
            {loading ? <LoaderCircle size={17} className="spin" /> : <Wallet size={17} />}
            {loading ? "Waiting for signature…" : "Sign & generate QR"}
          </Button>
        </div>
      )}
      {error && !alreadyCheckedIn && <p className="form-error">{error}</p>}
    </Card>
  );
}
