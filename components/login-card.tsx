"use client";

import { ArrowLeft, CheckCircle2, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WalletButton } from "./wallet-button";

export function LoginCard() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);

  return <main className="login-page">
    <div className="login-glow" aria-hidden="true" />
    <Link href="/" className="login-back"><ArrowLeft size={16} /> Back to home</Link>
    <section className="login-card" aria-labelledby="login-title">
      <div className="login-mark"><Wallet size={27} /></div>
      <span className="section-kicker">Member access</span>
      <h1 id="login-title">Enter with MetaMask.</h1>
      <p>Connect your wallet, switch to Ethereum Sepolia, and sign a free message to prove that the wallet belongs to you.</p>
      <div className="login-steps">
        <div><span>01</span><strong>Connect MetaMask</strong></div>
        <div><span>02</span><strong>Sign the login message</strong></div>
        <div><span>03</span><strong>Enter your workspace</strong></div>
      </div>
      <label className="login-remember">
        <input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} />
        <span>Keep me signed in for 30 days<small>Only use this on a device you trust.</small></span>
      </label>
      <WalletButton
        rememberMe={rememberMe}
        onSignedIn={(_address, isRegistered) => {
          router.replace(isRegistered ? "/dashboard" : "/register");
        }}
      />
      <div className="login-safety"><ShieldCheck size={16} /><span>No gas fee. No blockchain transaction. Your private key never leaves MetaMask.</span></div>
    </section>
    <div className="login-proof"><CheckCircle2 size={15} /> Challenge expires in five minutes and can only be used once.</div>
  </main>;
}
