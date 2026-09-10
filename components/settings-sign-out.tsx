"use client";

import { useState } from "react";
import { useDisconnect } from "wagmi";

export function SettingsSignOut() {
  const { disconnectAsync } = useDisconnect();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Could not sign out. Please retry.");
      try { await disconnectAsync(); } finally { window.location.replace("/login"); }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign out. Please retry.");
      setBusy(false);
    }
  }

  return <div>
    <button className="wallet-button" disabled={busy} onClick={signOut}>{busy ? "Signing out…" : "Sign out"}</button>
    {error && <p role="alert">{error}</p>}
  </div>;
}
