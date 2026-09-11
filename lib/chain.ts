import { defineChain } from "viem";

export const sepolia = defineChain({
  id: 11_155_111,
  name: "Sepolia",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        "https://ethereum-sepolia-rpc.publicnode.com",
        "https://rpc.sepolia.org",
        "https://sepolia.drpc.org",
        "https://1rpc.io/sepolia",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
    },
  },
  testnet: true,
});

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

