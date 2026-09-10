import Link from "next/link";
import { ArrowRight, Lightbulb, Users, FileCheck2, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

const steps = [
  { number: "01", icon: Lightbulb, title: "Propose an idea", copy: "Bring your next workshop, bold idea, or funding request to the collective.", href: "/proposals/new" },
  { number: "02", icon: Users, title: "Make it collective", copy: "Discuss, decide, and vote together. Every member has an equal say.", href: "/proposals" },
  { number: "03", icon: FileCheck2, title: "Keep the proof", copy: "Follow the decision. Verify the record. Keep your club accountable.", href: "/admin/integrity" },
];

export default function LandingPage() {
  return <div className="landing">
    <a href="#main-intro" className="skip-link">Skip to content</a>
    <header className="landing-nav">
      <Link className="landing-logo" href="/" aria-label="Campus DAO home">Campus DAO<span className="logo-dot" /></Link>
      <nav aria-label="Site navigation"><a href="#how-it-works">How it works</a><Link href="/proposals">Governance</Link></nav>
      <Link className="landing-button" href="/dashboard">Launch app <ArrowUpRight size={17} /></Link>
    </header>
    <section className="landing-hero" id="main-intro">
      <div className="hero-copy">
        <h1><span className="cut-line"><span>Your campus.</span></span><span className="cut-line"><span>Your voice.</span></span><span className="cut-line"><span>On record.</span></span></h1>
        <p>A shared space to propose ideas, make decisions,<br className="desktop-break" /> and keep your club accountable.</p>
        <div className="hero-actions"><Link href="/dashboard" className="landing-button">Enter the club <ArrowRight size={18} /></Link><a href="#how-it-works" className="landing-button outline">Explore the process</a></div>
      </div>
      <div className="orbit-scene" role="img" aria-label="Propose, vote, and verify orbit a shared Campus DAO">
        <div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-ring ring-three" />
        <div className="orbit-axis" />
        <div className="orbit-center">C</div>
        <span className="orbit-node node-propose"><i />Propose</span>
        <span className="orbit-node node-vote"><i />Vote</span>
        <span className="orbit-node node-verify"><i />Verify</span>
      </div>
      <span className="hero-footnote">Clubs. People. Progress.</span>
    </section>
    <div className="belief-band"><span className="band-dot" /><p>One member, one vote. Every decision, verifiable.</p><span className="band-dot" /></div>
    <section className="process-section" id="how-it-works" aria-label="How Campus DAO works">
      {steps.map(step => <Reveal key={step.number}><Link className="process-step" href={step.href}><span className="step-number">{step.number}</span><step.icon className="step-icon" size={22} strokeWidth={1.3} /><div><h2>{step.title}</h2><p>{step.copy}</p></div><ArrowRight className="step-arrow" size={25} strokeWidth={1} /></Link></Reveal>)}
    </section>
    <Reveal><section className="landing-closing"><div className="closing-curve" /><h2>Build a club you believe in.</h2><p>Real people. Shared decisions. A more transparent campus.</p><Link href="/dashboard" className="landing-button">Enter the club <ArrowRight size={18} /></Link></section></Reveal>
    <footer className="landing-footer"><Link href="/">Campus DAO</Link><span>Built for participation.</span><Link href="/settings">Polygon Amoy · Testnet only <ArrowUpRight size={14} /></Link></footer>
  </div>;
}
