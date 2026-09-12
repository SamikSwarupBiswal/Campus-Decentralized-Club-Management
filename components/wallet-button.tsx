"use client";

import { LoaderCircle, LogOut, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain } from "wagmi";
import { sepolia } from "@/lib/chain";
import { shortAddress } from "@/lib/utils";

export function WalletButton({ compact = false, rememberMe = false, onSignedIn }: { compact?: boolean; rememberMe?: boolean; onSignedIn?: (address: string, isRegistered?: boolean) => void }) {
  const { address, chainId, isConnected, status } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const [signedIn, setSignedIn] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const currentAddress = useRef(address);
  currentAddress.current = address;

  useEffect(() => {
    if (status === "connecting" || status === "reconnecting") return;
    let active = true;
    setSignedIn(null);
    fetch("/api/auth/session", { cache: "no-store" }).then(r => r.json()).then(async session => {
      if (!active) return;
      if (session.address && address && session.address !== address.toLowerCase()) {
        await fetch("/api/auth/logout", { method: "POST" });
      } else if (active) setSignedIn(session.address);
    }).catch(() => { if (active) setError("Unable to check your session. Try signing in again."); });
    return () => { active = false; };
  }, [address, status]);

  async function act() {
    setBusy(true);
    setError("");
    const isMobile = typeof window !== "undefined" && /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    const hasInjected = typeof window !== "undefined" && Boolean((window as unknown as { ethereum?: unknown }).ethereum);

    try {
      let targetAddress = address;

      if (!isConnected || !targetAddress) {
        if (isMobile && !hasInjected) {
          const dappUrl = window.location.host + window.location.pathname;
          window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
          return;
        }
        const connector =
          connectors.find((c) => c.name.toLowerCase().includes("metamask")) ||
          connectors[0];
        if (!connector) {
          if (isMobile) {
            const dappUrl = window.location.host + window.location.pathname;
            window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
            return;
          }
          throw new Error("Install MetaMask or open this site in its mobile browser.");
        }
        const connection = await connectAsync({ connector, chainId: sepolia.id });
        targetAddress = connection.accounts[0];
      }

      if (chainId !== sepolia.id) {
        try {
          await switchChainAsync({ chainId: sepolia.id });
        } catch {
          // Chain switch might already be handled by connector
        }
      }

      if (!targetAddress) {
        targetAddress = currentAddress.current || address;
      }
      if (!targetAddress) {
        throw new Error("No wallet account selected. Please unlock MetaMask.");
      }

      const signingAddress = targetAddress;
      const response = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: targetAddress }),
      });
      const challenge = await response.json();
      if (!response.ok) throw new Error(challenge.error || "Unable to prepare sign-in.");

      const signature = await signMessageAsync({
        account: targetAddress,
        message: challenge.message,
      });

      const verified = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: targetAddress,
          signature,
          message: challenge.message,
          rememberMe,
        }),
      });
      const result = await verified.json();
      if (!verified.ok) throw new Error(result.error || "Sign-in failed.");

      setSignedIn(result.address);
      onSignedIn?.(result.address, result.isRegistered);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message.split("\n")[0]
          : "Wallet request failed. Please retry.";
      if (
        isMobile &&
        (msg.toLowerCase().includes("provider") ||
          msg.toLowerCase().includes("not found"))
      ) {
        const dappUrl = window.location.host + window.location.pathname;
        window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
        return;
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Could not end the server session. Please retry.");
      setSignedIn(null);
      try {
        await disconnectAsync();
      } finally {
        window.location.replace("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-out failed");
    } finally {
      setBusy(false);
    }
  }

  const label = signedIn
    ? shortAddress(signedIn)
    : !isConnected
      ? "Enter with MetaMask"
      : chainId !== sepolia.id
        ? "Switch to Sepolia & Sign in"
        : "Sign in with MetaMask";

  return (
    <div className="wallet-wrap">
      <button
        className="wallet-button"
        onClick={signedIn ? logout : act}
        disabled={busy}
        aria-label={signedIn ? "Sign out and disconnect" : label}
      >
        {busy ? (
          <LoaderCircle size={17} className="spin" />
        ) : signedIn ? (
          <LogOut size={17} />
        ) : (
          <Wallet size={17} />
        )}
        {!compact && <span>{busy ? "Opening MetaMask…" : label}</span>}
      </button>
      {signedIn && !compact && (
        <small className="auth-status">Signed in · Sign out above</small>
      )}
      {error && (
        <p className="wallet-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
