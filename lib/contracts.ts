import type { Address } from "viem";

function address(value: string | undefined): Address | undefined {
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) return undefined;
  return value as Address;
}

export const contractAddresses = {
  membership: address(process.env.NEXT_PUBLIC_MEMBERSHIP_CONTRACT),
  governor: address(process.env.NEXT_PUBLIC_GOVERNOR_CONTRACT),
  treasury: address(process.env.NEXT_PUBLIC_TREASURY_CONTRACT),
  attendance: address(process.env.NEXT_PUBLIC_ATTENDANCE_CONTRACT),
};

export const membershipAbi = [
  {
    type: "function",
    name: "isMember",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "memberCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const governorAbi = [
  {
    type: "function",
    name: "castVote",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "support", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "createProposal",
    stateMutability: "nonpayable",
    inputs: [
      { name: "metadataHash", type: "bytes32" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "votingBlocks", type: "uint64" },
    ],
    outputs: [{ name: "proposalId", type: "uint256" }],
  },
  {
    type: "function",
    name: "execute",
    stateMutability: "nonpayable",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [],
  },
] as const;

export const attendanceAbi = [
  {
    type: "function",
    name: "finalizeAttendance",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "bytes32" },
      { name: "attendanceHash", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;
