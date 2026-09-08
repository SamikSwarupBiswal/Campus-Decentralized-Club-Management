import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { X, ExternalLink, History, CheckCircle2 } from "lucide-react";
import { truncateTxHash, formatTimestamp } from "../utils/cryptoUtils";

export function TxHistoryModal({ isOpen, onClose }) {
  const { transactions } = useWeb3();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-700/80 shadow-2xl relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">On-Chain Transaction Ledger</h3>
              <p className="text-xs text-slate-400">Auditable append-only history emitted by Solidity smart contracts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of transactions */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No transactions recorded in this session yet. Perform a vote or proposal action to generate on-chain transactions!
            </div>
          ) : (
            transactions.map((tx, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-dot badge-dot-green"></span>
                    <span className="text-xs font-mono font-bold text-indigo-300">{tx.method}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      Block #{tx.blockNumber || 10420 + idx}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">{tx.description}</p>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Hash: <span className="text-slate-300">{truncateTxHash(tx.hash)}</span> • {formatTimestamp(tx.timestamp)}
                  </div>
                </div>

                <a
                  href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="self-start sm:self-center flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20"
                >
                  <span>Verify</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 rounded-b-2xl flex justify-between items-center text-xs text-slate-400">
          <span>Total Transactions: {transactions.length}</span>
          <button
            onClick={onClose}
            className="btn btn-secondary py-1.5 px-4 text-xs"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
