"use client";

import { Clock3, LoaderCircle, QrCode, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { Button, Card } from "./ui";

export function AttendanceQr({ eventId }: { eventId: string }) {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const [image, setImage] = useState<string>();
  const [expiresAt, setExpiresAt] = useState<number>();
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

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
      };
      if (!response.ok || !challenge.message || !challenge.expiresAt) {
        throw new Error(challenge.error || "Unable to create challenge");
      }
      const signature = await signMessageAsync({ message: challenge.message });
      const payload = JSON.stringify({
        eventId,
        wallet: address,
        timestamp: challenge.timestamp,
        nonce: challenge.nonce,
        message: challenge.message,
        signature,
      });
      setImage(
        await QRCode.toDataURL(payload, {
          width: 560,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
          errorCorrectionLevel: "M",
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
          <h2>Signed attendance QR</h2>
        </div>
        <QrCode size={20} />
      </div>
      {image ? (
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
      {error && <p className="form-error">{error}</p>}
    </Card>
  );
}
