import { createPublicClient, http } from "viem";
import { contractAddresses, membershipAbi } from "@/lib/contracts";
import { members } from "@/lib/demo-data";
import { polygonAmoy } from "@/lib/chain";

export const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(
    process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology",
  ),
});

export async function isVerifiedMember(wallet: `0x${string}`) {
  if (!contractAddresses.membership) {
    return members.some(
      (member) =>
        member.status === "Active" &&
        member.wallet.toLowerCase() === wallet.toLowerCase(),
    );
  }
  return publicClient.readContract({
    address: contractAddresses.membership,
    abi: membershipAbi,
    functionName: "isMember",
    args: [wallet],
  });
}
