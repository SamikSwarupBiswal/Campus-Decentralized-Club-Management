"use client";
 
import { QueryClient } from "@tanstack/react-query";
import { createConfig, fallback, http, injected } from "wagmi";
import { sepolia } from "@/lib/chain";

const rpcEndpoints = [
  process.env.NEXT_PUBLIC_RPC_URL,
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc.sepolia.org",
  "https://sepolia.drpc.org",
  "https://1rpc.io/sepolia",
].filter(Boolean) as string[];

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [sepolia.id]: fallback(rpcEndpoints.map((url) => http(url))),
  },
  ssr: true,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
