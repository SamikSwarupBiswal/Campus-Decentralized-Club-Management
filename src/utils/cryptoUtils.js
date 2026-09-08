import { ethers } from "ethers";

/**
 * Computes keccak256 hash of a plain text string.
 */
export function hashText(text) {
  if (!text) return ethers.ZeroHash;
  return ethers.keccak256(ethers.toUtf8Bytes(text));
}

/**
 * Computes canonical keccak256 hash of a JSON record set for tamper-evidence.
 */
export function hashRecordSet(records) {
  if (!records || records.length === 0) return ethers.ZeroHash;
  // Sort keys for canonical representation
  const canonicalString = JSON.stringify(records, Object.keys(records[0] || {}).sort());
  return ethers.keccak256(ethers.toUtf8Bytes(canonicalString));
}

/**
 * Formats Ethereum address to shortened form: 0x71A...93C
 */
export function truncateAddress(address) {
  if (!address) return "Not Connected";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formats a transaction hash: 0x3b89...f192
 */
export function truncateTxHash(hash) {
  if (!hash) return "";
  if (hash.length < 12) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

/**
 * Formats a number to Indian Rupee (INR) representation: ₹15,000
 */
export function formatINR(amount) {
  if (isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats Unix timestamp to human-readable date.
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return "N/A";
  const date = typeof timestamp === "number" && timestamp < 10000000000 
    ? new Date(timestamp * 1000) 
    : new Date(timestamp);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
