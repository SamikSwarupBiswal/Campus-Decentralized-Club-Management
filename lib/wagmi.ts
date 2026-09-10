"use client";

import { QueryClient } from "@tanstack/react-query";
import { createConfig, http, injected } from "wagmi";
import { polygonAmoy } from "@/lib/chain";

export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [polygonAmoy.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology",
    ),
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
