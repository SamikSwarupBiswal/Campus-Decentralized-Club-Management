"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FormEvent, KeyboardEvent, useMemo, useState } from "react";

export type ComposeMention = { id: string; label: string; sublabel?: string };
export type ComposeCommand = { id: string; label: string; hint?: string };
export type ComposeProps = { defaultValue?: string; mentions?: ComposeMention[]; commands?: ComposeCommand[]; maxLength?: number; onSubmit?: (value: string) => void; submitLabel?: string };

export function Compose({ defaultValue = "", mentions = [], commands = [], maxLength = 500, onSubmit, submitLabel = "Create proposal" }: ComposeProps) {
  const [value, setValue] = useState(defaultValue);
  const [submitted, setSubmitted] = useState(false);
  const reduce = useReducedMotion();
  const trigger = useMemo(() => {
    const match = value.match(/(?:^|\s)([@/])([^\s]*)$/);
    return match ? { type: match[1], query: match[2].toLowerCase(), start: match.index! + (match[0].startsWith(" ") ? 1 : 0) } : null;
  }, [value]);
  const results = trigger?.type === "@" ? mentions.filter(item => item.label.toLowerCase().includes(trigger.query)) : trigger?.type === "/" ? commands.filter(item => item.label.toLowerCase().includes(trigger.query)) : [];
  function insert(label: string) { if (trigger) setValue(value.slice(0, trigger.start) + trigger.type + label + " "); }
  function submit(event?: FormEvent) { event?.preventDefault(); if (!value.trim() || value.length > maxLength) return; setSubmitted(true); onSubmit?.(value); window.setTimeout(() => setSubmitted(false), 2200); }
  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) submit(); }

  return <form className="compose-root" onSubmit={submit}>
    <div className="compose-ring" aria-hidden="true" />
    <div className="compose-shell">
      <div className="compose-head"><strong>Compose a proposal</strong><span><i /> Ready to create</span></div>
      <div className="compose-field">
        <textarea aria-label="Compose a proposal" value={value} maxLength={maxLength} onChange={event => setValue(event.target.value)} onKeyDown={keyDown} placeholder="Propose the next open-source night…" />
        <AnimatePresence>{trigger && results.length > 0 ? <motion.div className="compose-menu" initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {results.slice(0, 5).map(item => <button type="button" key={item.id} onMouseDown={() => insert(item.label)}><b>{trigger.type}{item.label}</b><small>{"sublabel" in item ? item.sublabel : "hint" in item ? item.hint : ""}</small></button>)}
        </motion.div> : null}</AnimatePresence>
      </div>
      <div className="compose-meta"><span><kbd>@</kbd> mention a member</span><span><kbd>/</kbd> use a command</span><span>{value.length}/{maxLength}</span></div>
      <div className="compose-actions"><span>Press Ctrl + Enter</span><button type="submit" disabled={!value.trim()}>{submitted ? "Draft ready" : submitLabel}<span>↗</span></button></div>
    </div>
  </form>;
}

export default Compose;
