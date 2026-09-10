"use client";

import { ArrowLeft, CheckCircle2, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WalletButton } from "./wallet-button";

export function LoginCard() {
  const router = useRouter();

  return <main className="login-page">
    <div className="login-glow" aria-hidden="true" />
    <Link href="/" className="login-back"><ArrowLeft size={16} /> Back to home</Link>
    <section className="login-card" aria-labelledby="login-title">
      <div className="login-mark"><Wallet size={27} /></div>
      <span className="section-kicker">Member access</span>
      <h1 id="login-title">Enter with MetaMask.</h1>
      <p>Connect your wallet, switch to Polygon Amoy, and sign a free message to prove that the wallet belongs to you.</p>
      <div className="login-steps">
        <div><span>01</span><strong>Connect MetaMask</strong></div>
        <div><span>02</span><strong>Sign the login message</strong></div>
        <div><span>03</span><strong>Enter your workspace</strong></div>
      </div>
      <WalletButton onSignedIn={() => router.replace("/dashboard")} />
      <div className="login-safety"><ShieldCheck size={16} /><span>No gas fee. No blockchain transaction. Your private key never leaves MetaMask.</span></div>
    </section>
    <div className="login-proof"><CheckCircle2 size={15} /> Challenge expires in five minutes and can only be used once.</div>
  </main>;
}
