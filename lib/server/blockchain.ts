import { createPublicClient, fallback, http } from "viem";
import { contractAddresses, membershipAbi } from "@/lib/contracts";
import { sepolia } from "@/lib/chain";

const rpcEndpoints = [
  process.env.NEXT_PUBLIC_RPC_URL,
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc.sepolia.org",
  "https://sepolia.drpc.org",
  "https://1rpc.io/sepolia",
].filter(Boolean) as string[];

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: fallback(rpcEndpoints.map((url) => http(url))),
});

import { isMemberRegistered, isAdminWallet } from "@/lib/server/session";

export async function isVerifiedMember(wallet: `0x${string}`) {
  const normalized = wallet.toLowerCase() as `0x${string}`;
  if (isAdminWallet(normalized)) {
    return true;
  }
  if (contractAddresses.membership) {
    try {
      const isMember = await publicClient.readContract({
        address: contractAddresses.membership,
        abi: membershipAbi,
        functionName: "isMember",
        args: [normalized],
      });
      if (isMember) return true;
    } catch {
      // If contract call fails or reverts, fallback to database check below
    }
  }
  const registered = await isMemberRegistered(normalized);
  if (registered) return true;

  // In testnet demonstration mode before smart contracts are deployed on-chain,
  // allow any connected wallet to generate and test attendance QR passes
  if (!contractAddresses.membership) {
    return true;
  }

  return false;
}
