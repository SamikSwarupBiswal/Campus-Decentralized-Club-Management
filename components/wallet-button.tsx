"use client";

import { Check, ChevronDown, LoaderCircle, LogOut, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
} from "wagmi";
import { polygonAmoy } from "@/lib/chain";
import { shortAddress } from "@/lib/utils";

export function WalletButton({ compact = false }: { compact?: boolean }) {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const [open, setOpen] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function authenticate() {
    if (!address) return;
    setAuthenticating(true);
    try {
      const challengeResponse = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const challenge = (await challengeResponse.json()) as { message?: string };
      if (!challenge.message) throw new Error("Challenge unavailable");
      const signature = await signMessageAsync({ message: challenge.message });
      await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature, message: challenge.message }),
      });
    } finally {
      setAuthenticating(false);
    }
  }

  if (!isConnected) {
    return (
      <button
        className="wallet-button"
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isConnecting || !connectors.length}
      >
        {isConnecting ? (
          <LoaderCircle size={16} className="spin" />
        ) : (
          <Wallet size={16} />
        )}
        {!compact && <span>{isConnecting ? "Connecting…" : "Connect wallet"}</span>}
      </button>
    );
  }

  if (chainId !== polygonAmoy.id) {
    return (
      <button
        className="wallet-button network-wrong"
        onClick={() => switchChain({ chainId: polygonAmoy.id })}
        disabled={isSwitching}
      >
        {isSwitching ? <LoaderCircle size={16} className="spin" /> : <Wallet size={16} />}
        {!compact && <span>Switch to Amoy</span>}
      </button>
    );
  }

  return (
    <div className="wallet-wrap" ref={menuRef}>
      <button className="wallet-button connected" onClick={() => setOpen(!open)}>
        <span className="live-dot" aria-hidden="true" />
        {!compact && <span>{shortAddress(address)}</span>}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="wallet-menu">
          <div className="wallet-menu-head">
            <span>Connected on</span>
            <strong>
              <Check size={13} /> Polygon Amoy
            </strong>
          </div>
          <button onClick={authenticate} disabled={authenticating}>
            {authenticating ? (
              <LoaderCircle size={15} className="spin" />
            ) : (
              <Wallet size={15} />
            )}
            Sign in to Campus DAO
          </button>
          <button onClick={() => disconnect()}>
            <LogOut size={15} /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
