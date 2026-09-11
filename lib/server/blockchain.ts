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

export async function isVerifiedMember(wallet: `0x${string}`) {
  if (!contractAddresses.membership) {
    return false;
  }
  return publicClient.readContract({
    address: contractAddresses.membership,
    abi: membershipAbi,
    functionName: "isMember",
    args: [wallet],
  });
}
