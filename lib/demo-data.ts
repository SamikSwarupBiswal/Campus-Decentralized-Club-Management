import type {
  ClubEvent,
  Member,
  Proposal,
  TreasuryTransaction,
} from "./types";

export const proposals: Proposal[] = [
  {
    id: "prop-104",
    onchainId: 104,
    title: "Fund the annual open-source hacknight",
    summary:
      "Allocate 0.12 Test POL for venue logistics, hardware adapters, and participant refreshments.",
    description:
      "The engineering club proposes a 12-hour campus hacknight focused on tools for accessibility and public infrastructure. The requested treasury allocation will be demonstrated with Test POL and reconciled against an itemized event report after completion.",
    category: "Treasury",
    proposer: "0x7A8f113604769cb18483B1Ac4B99a6cc9872f71B",
    recipient: "0x81f38A31f3518C7a248b5744242e0Cf2E94d1Be3",
    amount: "0.12 POL",
    state: "Active",
    yesVotes: 86,
    noVotes: 18,
    abstainVotes: 9,
    memberSnapshot: 168,
    endsAt: "2026-07-27T18:30:00.000Z",
    createdAt: "2026-07-21T10:00:00.000Z",
    metadataHash:
      "0xf75aad467929372099102560041097383089a8f90bfbdad1c788d92e791070e8",
  },
  {
    id: "prop-103",
    onchainId: 103,
    title: "Adopt a monthly build-in-public forum",
    summary:
      "Create a recurring cross-club forum where teams publish progress, blockers, and open contribution calls.",
    description:
      "The forum will run on the first Friday of each month. Every campus club can reserve one ten-minute slot, with public notes and follow-up actions recorded by the organizing team.",
    category: "Community",
    proposer: "0x62C18C31bd7d6822D93147E650FeB18d6A331CA7",
    state: "Passed",
    yesVotes: 118,
    noVotes: 21,
    abstainVotes: 11,
    memberSnapshot: 164,
    endsAt: "2026-07-18T18:30:00.000Z",
    createdAt: "2026-07-12T09:30:00.000Z",
    metadataHash:
      "0xc3fc844352a602f2910807a3963000354b129f3232532885fc941eb068357c42",
  },
  {
    id: "prop-102",
    onchainId: 102,
    title: "Renew the robotics lab access schedule",
    summary:
      "Continue supervised evening lab access for verified club members during the next semester.",
    description:
      "Renew the weekday 18:00–21:00 schedule with one trained lab steward present. Access logs remain private; policy approval and the final schedule hash remain verifiable.",
    category: "Operations",
    proposer: "0x19B25aAF70169B7E58D45770926315656544b3Ce",
    state: "Executed",
    yesVotes: 132,
    noVotes: 8,
    abstainVotes: 6,
    memberSnapshot: 161,
    endsAt: "2026-07-05T18:30:00.000Z",
    createdAt: "2026-06-28T14:15:00.000Z",
    metadataHash:
      "0x3aa1246b5915a957355c0e4f53958243d5f68074e1388bba30121aec8168a738",
  },
  {
    id: "prop-101",
    onchainId: 101,
    title: "Move club orientation to the central auditorium",
    summary:
      "Reserve a larger venue for orientation based on last year’s registration demand.",
    description:
      "The proposal requests a venue change but did not receive sufficient member participation before its voting deadline.",
    category: "Events",
    proposer: "0x34e2520d8cEd68d26A8B84B40EBb7BE9A3d06cb1",
    state: "Defeated",
    yesVotes: 31,
    noVotes: 22,
    abstainVotes: 5,
    memberSnapshot: 160,
    endsAt: "2026-06-22T18:30:00.000Z",
    createdAt: "2026-06-15T11:45:00.000Z",
    metadataHash:
      "0x4ec2442cb7099de3aa735bd7b0827ad54ef22ca77f72d9a1841c9df91ca4fe5d",
  },
];

export const events: ClubEvent[] = [
  {
    id: "evt-open-source-night",
    name: "Open Source Night",
    description:
      "Lightning talks, maintainer office hours, and a guided first contribution.",
    date: "2026-07-26",
    startTime: "17:30",
    endTime: "20:30",
    venue: "Innovation Lab · Block C",
    organizer: "Engineering Club",
    proposalId: "prop-103",
    attendanceStatus: "Upcoming",
    attendees: 0,
    capacity: 120,
  },
  {
    id: "evt-robotics-workshop",
    name: "Robotics Build Workshop",
    description:
      "Hands-on sensor calibration and autonomous navigation fundamentals.",
    date: "2026-07-24",
    startTime: "14:00",
    endTime: "17:00",
    venue: "Robotics Lab · Block A",
    organizer: "Robotics Club",
    attendanceStatus: "Open",
    attendees: 47,
    capacity: 64,
  },
  {
    id: "evt-design-critique",
    name: "Interface Design Critique",
    description:
      "A structured critique session for student-built digital products.",
    date: "2026-07-19",
    startTime: "16:00",
    endTime: "18:00",
    venue: "Studio 204 · Design Wing",
    organizer: "Design Collective",
    attendanceStatus: "Finalized",
    attendees: 58,
    capacity: 72,
  },
];

export const members: Member[] = [
  {
    id: "member-001",
    name: "Ananya Rao",
    department: "Computer Science · 3rd year",
    studentId: "CS23-041",
    wallet: "0x7A8f113604769cb18483B1Ac4B99a6cc9872f71B",
    role: "Admin",
    status: "Active",
    joinedAt: "2026-01-08T00:00:00.000Z",
    participation: 94,
  },
  {
    id: "member-002",
    name: "Vikram Sen",
    department: "Electronics · 2nd year",
    studentId: "EC24-116",
    wallet: "0x62C18C31bd7d6822D93147E650FeB18d6A331CA7",
    role: "Member",
    status: "Active",
    joinedAt: "2026-01-12T00:00:00.000Z",
    participation: 88,
  },
  {
    id: "member-003",
    name: "Meera Iyer",
    department: "Mechanical · 4th year",
    studentId: "ME22-077",
    wallet: "0x19B25aAF70169B7E58D45770926315656544b3Ce",
    role: "Member",
    status: "Active",
    joinedAt: "2026-02-03T00:00:00.000Z",
    participation: 79,
  },
  {
    id: "member-004",
    name: "Rohan Das",
    department: "Information Technology · 2nd year",
    studentId: "IT24-209",
    wallet: "0x34e2520d8cEd68d26A8B84B40EBb7BE9A3d06cb1",
    role: "Member",
    status: "Active",
    joinedAt: "2026-02-10T00:00:00.000Z",
    participation: 63,
  },
];

export const treasuryTransactions: TreasuryTransaction[] = [
  {
    id: "tx-1",
    proposalId: "102",
    label: "Robotics lab access deposit",
    recipient: "0x49e1029c08C7CA697163bD66f27ACD3F2a3b6641",
    amount: "0.08 POL",
    timestamp: "2026-07-07T13:42:00.000Z",
    txHash:
      "0x118f9364543b429f5a17b93a3b172f821963f272e8c9393110d6077c7916c2a1",
    status: "Executed",
  },
  {
    id: "tx-2",
    proposalId: "99",
    label: "Design sprint materials",
    recipient: "0x93C623fA23C57215c56272D336B4F2e6F87F3155",
    amount: "0.04 POL",
    timestamp: "2026-06-21T09:18:00.000Z",
    txHash:
      "0xc8a0f8d2ab23c41c2c09cf517c89b0a9bce9137387501221f66030e7446f8081",
    status: "Executed",
  },
  {
    id: "tx-3",
    proposalId: "96",
    label: "Community radio equipment",
    recipient: "0x7B026bb2675172A1552b6Fca5ab041d4B1845361",
    amount: "0.06 POL",
    timestamp: "2026-06-04T15:25:00.000Z",
    txHash:
      "0x74e57c2c2cd4ba34a2eb93008a9aa750ba8b7ccf43f01d9aba2a4f36c52b9291",
    status: "Executed",
  },
];

export const activity = [
  {
    title: "Vote recorded on proposal #104",
    meta: "Vikram Sen · 7 min ago",
    type: "vote",
  },
  {
    title: "Attendance window opened",
    meta: "Robotics Build Workshop · 28 min ago",
    type: "attendance",
  },
  {
    title: "Member wallet registered",
    meta: "CS23-184 · 1 hr ago",
    type: "member",
  },
  {
    title: "Treasury proposal reached quorum",
    meta: "Proposal #104 · 2 hrs ago",
    type: "treasury",
  },
];
