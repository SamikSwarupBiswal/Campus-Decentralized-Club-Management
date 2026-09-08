import React, { useState } from "react";
import { CheckCircle2, ExternalLink, Copy, Check, X, ShieldCheck } from "lucide-react";
import { truncateTxHash } from "../utils/cryptoUtils";

export function TxNotificationModal({ tx, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!tx) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(tx.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-fade-in">
      <div className="glass-panel p-5 border border-emerald-500/40 bg-slate-950/95 shadow-2xl rounded-2xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Transaction Confirmed On-Chain</h4>
              <p className="text-[11px] text-emerald-400 font-mono">Block #{tx.blockNumber || 10421} • Success</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          {tx.description}
        </p>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Method:</span>
            <span className="font-mono text-indigo-300 font-semibold">{tx.method}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Tx Hash:</span>
            <div className="flex items-center gap-1.5 font-mono text-slate-200">
              <span>{truncateTxHash(tx.hash)}</span>
              <button
                onClick={handleCopy}
                className="p-1 hover:text-white text-slate-400 rounded transition-colors"
                title="Copy full transaction hash"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Independent Explorer Audit</span>
          <a
            href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View on Explorer <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
