export type ProposalState =
  | "Active"
  | "Passed"
  | "Defeated"
  | "Executed"
  | "Pending";

export type VoteChoice = "YES" | "NO" | "ABSTAIN";

export interface Proposal {
  id: string;
  onchainId: number;
  title: string;
  summary: string;
  description: string;
  category: "Treasury" | "Events" | "Operations" | "Community";
  proposer: `0x${string}`;
  recipient?: `0x${string}`;
  amount?: string;
  state: ProposalState;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  memberSnapshot: number;
  endsAt: string;
  createdAt: string;
  metadataHash: `0x${string}`;
}

export type EventAttendanceStatus = "Upcoming" | "Open" | "Finalized" | "Closed";

export interface ClubEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  organizer: string;
  proposalId?: string;
  attendanceStatus: EventAttendanceStatus;
  attendees: number;
  capacity: number;
}

export interface Member {
  id: string;
  name: string;
  department: string;
  studentId: string;
  wallet: `0x${string}`;
  role: "Admin" | "Member";
  status: "Active" | "Revoked";
  joinedAt: string;
  participation: number;
}

export interface TreasuryTransaction {
  id: string;
  proposalId: string;
  label: string;
  recipient: `0x${string}`;
  amount: string;
  timestamp: string;
  txHash: `0x${string}`;
  status: "Executed" | "Pending";
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  wallet: `0x${string}`;
  checkedInAt: string;
  nonce: string;
}
