import { createPublicClient, http } from "viem";
import { contractAddresses, membershipAbi } from "@/lib/contracts";
import { polygonAmoy } from "@/lib/chain";

export const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(
    process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology",
  ),
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
