"use client";

import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck, UserCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { shortAddress } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((session) => {
        if (!session.address) {
          router.replace("/login");
          return;
        }
        if (session.isRegistered) {
          router.replace("/dashboard");
          return;
        }
        setAddress(session.address);
        setLoading(false);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      studentId: formData.get("studentId"),
      department: formData.get("department"),
      year: formData.get("year"),
    };

    try {
      const response = await fetch("/api/members/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed. Please retry.");
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration error");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="login-page">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <LoaderCircle size={32} className="spin" />
          <p style={{ color: "var(--muted)" }}>Checking membership status…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <div className="login-glow" aria-hidden="true" />
      <Link href="/login" className="login-back">
        <ArrowLeft size={16} /> Back to sign in
      </Link>
      <section className="login-card" aria-labelledby="register-title" style={{ maxWidth: 520 }}>
        <div className="login-mark">
          <UserCheck size={27} />
        </div>
        <span className="section-kicker">Member onboarding</span>
        <h1 id="register-title">Register your membership.</h1>
        <p>
          Before entering the club workspace, please enter your details to register as a verified member of the collective.
        </p>

        {address && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 13,
            }}
          >
            <Wallet size={15} style={{ color: "var(--muted)" }} />
            <span style={{ color: "var(--muted)" }}>Connected wallet:</span>
            <strong className="mono" style={{ color: "#fff" }}>
              {shortAddress(address)}
            </strong>
          </div>
        )}

        {error && (
          <p className="wallet-error" role="alert" style={{ marginBottom: 16 }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-field full" style={{ textAlign: "left" }}>
            <label htmlFor="name" style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Full name <span style={{ color: "var(--accent, #e5e5e5)" }}>*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={120}
              placeholder="Your full name (e.g. Alex Morgan)"
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "left" }}>
            <div className="form-field">
              <label htmlFor="studentId" style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                Student ID
              </label>
              <input
                id="studentId"
                name="studentId"
                placeholder="CS24-101"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                }}
              />
            </div>

            <div className="form-field">
              <label htmlFor="year" style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                Academic year
              </label>
              <select
                id="year"
                name="year"
                defaultValue="1st year"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "#141414",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                }}
              >
                <option value="1st year">1st year</option>
                <option value="2nd year">2nd year</option>
                <option value="3rd year">3rd year</option>
                <option value="4th year">4th year</option>
              </select>
            </div>
          </div>

          <div className="form-field full" style={{ textAlign: "left" }}>
            <label htmlFor="department" style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Department / Branch
            </label>
            <input
              id="department"
              name="department"
              placeholder="e.g. Computer Science & Engineering"
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 14,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="wallet-button"
            style={{
              marginTop: 10,
              width: "100%",
              justifyContent: "center",
              padding: "12px 18px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {submitting ? (
              <>
                <LoaderCircle size={17} className="spin" />
                <span>Registering membership…</span>
              </>
            ) : (
              <>
                <span>Enter workspace</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className="login-safety" style={{ marginTop: 20 }}>
          <ShieldCheck size={16} />
          <span>Membership links this wallet to your student identity for club governance.</span>
        </div>
      </section>
    </main>
  );
}
