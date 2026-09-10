import { createPublicClient, fallback, http } from "viem";
import { contractAddresses, membershipAbi } from "@/lib/contracts";
import { polygonAmoy } from "@/lib/chain";

const rpcEndpoints = [
  process.env.NEXT_PUBLIC_RPC_URL,
  "https://polygon-amoy-bor-rpc.publicnode.com",
  "https://polygon-amoy.drpc.org",
  "https://rpc-amoy.polygon.technology",
].filter(Boolean) as string[];

export const publicClient = createPublicClient({
  chain: polygonAmoy,
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
