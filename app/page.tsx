import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingCompose } from "@/components/landing-compose";
import { Reveal } from "@/components/reveal";

const steps = [["01", "Propose an idea", "Share what you want to do, set the details, and put its fingerprint on-chain."], ["02", "Make it collective", "Discuss, decide, and vote together. Every member has an equal say."], ["03", "Keep the proof", "Follow the decision, verify the record, and keep your club accountable."]];

export default function LandingPage() {
  return <main className="mono-landing">
    <a href="#main-intro" className="skip-link">Skip to content</a>
    <header className="mono-nav"><Link href="/" className="mono-logo">Campus DAO</Link><nav><a href="#how-it-works">How it works</a><Link href="/proposals">Governance</Link></nav><Link href="/login" className="mono-signin">Sign in</Link></header>
    <section className="mono-hero" id="main-intro"><div className="mono-copy"><h1>Your campus.<br />Your voice.<br />On record.</h1><p>A decentralized home for college clubs to propose, decide, and prove what happens next.</p></div><LandingCompose /></section>
    <Reveal><section id="how-it-works" className="mono-steps">{steps.map(([number,title,copy]) => <article key={number}><div><span>{number}</span><i /></div><h2>{title}</h2><p>{copy}</p></article>)}</section></Reveal>
    <Reveal><section className="mono-close"><h2>Build a club you believe in.</h2><p>Sign in to start proposing, voting, and building together.</p><Link href="/login" className="mono-cta">Sign in with MetaMask <ArrowRight size={18} /></Link><small>Ethereum Sepolia · Testnet only</small></section></Reveal>
    <footer className="mono-footer"><strong>Campus DAO</strong><div><a href="#how-it-works">How it works</a><Link href="/proposals">Governance</Link><span>Ethereum Sepolia · Testnet only</span></div></footer>
  </main>;
}
