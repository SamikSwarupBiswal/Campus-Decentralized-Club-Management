"use client";

import { QueryClient } from "@tanstack/react-query";
import { createConfig, fallback, http, injected } from "wagmi";
import { polygonAmoy } from "@/lib/chain";

const rpcEndpoints = [
  process.env.NEXT_PUBLIC_RPC_URL,
  "https://polygon-amoy-bor-rpc.publicnode.com",
  "https://polygon-amoy.drpc.org",
  "https://rpc-amoy.polygon.technology",
].filter(Boolean) as string[];

export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [polygonAmoy.id]: fallback(rpcEndpoints.map((url) => http(url))),
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
