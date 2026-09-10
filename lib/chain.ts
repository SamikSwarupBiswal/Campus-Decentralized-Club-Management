import { defineChain } from "viem";

export const polygonAmoy = defineChain({
  id: 80_002,
  name: "Polygon Amoy",
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        "https://polygon-amoy-bor-rpc.publicnode.com",
        "https://polygon-amoy.drpc.org",
        "https://rpc-amoy.polygon.technology",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://amoy.polygonscan.com",
    },
  },
  testnet: true,
});
