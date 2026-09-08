// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MembershipContract.sol";

/**
 * @title TreasuryContract
 * @notice Provides transparent governance and voting approval for club budget requests.
 *
 * CRITICAL CLARIFICATION:
 * REAL INR FUNDS ≠ BLOCKCHAIN DEMO TREASURY
 * The actual money (e.g. ₹15,000 for a hackathon) remains in the college's existing banking/UPI system.
 * This contract produces an immutable, independently verifiable governance approval decision.
 */
contract TreasuryContract {
    enum ProposalState { Active, Approved, Rejected, Executed }

    struct SpendingProposal {
        uint256 id;
        bytes32 contentHash;      // keccak256 hash of justification & vendor details
        uint256 amountINR;        // Requested amount in Indian Rupees (for audit record)
        address proposer;
        bytes32 proposerStudentId;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        ProposalState state;
        bool demoFundsReleased;   // Demo/simulation token indicator
        bool exists;
    }

    MembershipContract public membership;

    uint256 public proposalCount;
    mapping(uint256 => SpendingProposal) public proposals;
    // proposalId => studentIdHash => hasVoted
    mapping(uint256 => mapping(bytes32 => bool)) public hasVoted;

    event SpendingProposalCreated(
        uint256 indexed proposalId,
        bytes32 indexed contentHash,
        uint256 amountINR,
        address indexed proposer,
        uint256 startTime,
        uint256 endTime
    );
    event SpendingVoted(uint256 indexed proposalId, bytes32 indexed studentIdHash, bool support, address voter);
    event SpendingApproved(uint256 indexed proposalId, uint256 amountINR, address indexed proposer, bytes32 studentIdHash);
    event SpendingRejected(uint256 indexed proposalId, uint256 yesVotes, uint256 noVotes);
    event DemoFundsReleased(uint256 indexed proposalId, uint256 amountINR, address recipient);

    modifier onlyTreasurerOrOfficer() {
        require(membership.isAuthorized(msg.sender), "TreasuryContract: Not authorized");
        MembershipContract.Role role = membership.roleOf(msg.sender);
        require(
            role == MembershipContract.Role.Treasurer ||
            role == MembershipContract.Role.Officer ||
            role == MembershipContract.Role.Admin,
            "TreasuryContract: Insufficient permissions (Treasurer, Officer, or Admin required)"
        );
        _;
    }

    constructor(address _membershipAddress) {
        require(_membershipAddress != address(0), "Invalid membership address");
        membership = MembershipContract(_membershipAddress);
    }

    /**
     * @notice Create a spending proposal with requested INR amount and content hash.
     */
    function createSpendingProposal(
        bytes32 contentHash,
        uint256 amountINR,
        uint256 votingPeriod
    ) external onlyTreasurerOrOfficer returns (uint256) {
        require(contentHash != bytes32(0), "Invalid content hash");
        require(amountINR > 0, "Amount must be greater than zero");
        require(votingPeriod >= 60, "Voting period must be at least 60 seconds");

        proposalCount++;
        uint256 pId = proposalCount;

        bytes32 studentId = membership.studentIdOf(msg.sender);

        proposals[pId] = SpendingProposal({
            id: pId,
            contentHash: contentHash,
            amountINR: amountINR,
            proposer: msg.sender,
            proposerStudentId: studentId,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            yesVotes: 0,
            noVotes: 0,
            state: ProposalState.Active,
            demoFundsReleased: false,
            exists: true
        });

        emit SpendingProposalCreated(pId, contentHash, amountINR, msg.sender, block.timestamp, block.timestamp + votingPeriod);
        return pId;
    }

    /**
     * @notice Cast vote on a spending proposal.
     */
    function voteOnSpendingProposal(uint256 proposalId, bool support) external {
        require(membership.isAuthorized(msg.sender), "TreasuryContract: Wallet not authorized");

        SpendingProposal storage p = proposals[proposalId];
        require(p.exists, "TreasuryContract: Spending proposal does not exist");
        require(p.state == ProposalState.Active, "TreasuryContract: Proposal is not active");
        require(block.timestamp <= p.endTime, "TreasuryContract: Voting window has closed");

        bytes32 studentId = membership.studentIdOf(msg.sender);
        require(studentId != bytes32(0), "TreasuryContract: No student ID linked");
        require(!hasVoted[proposalId][studentId], "TreasuryContract: Already voted on this proposal");

        hasVoted[proposalId][studentId] = true;

        if (support) {
            p.yesVotes++;
        } else {
            p.noVotes++;
        }

        emit SpendingVoted(proposalId, studentId, support, msg.sender);
    }

    /**
     * @notice Finalize spending proposal. If approved, emits SpendingApproved governance proof.
     */
    function finalizeSpendingProposal(uint256 proposalId) external {
        SpendingProposal storage p = proposals[proposalId];
        require(p.exists, "TreasuryContract: Spending proposal does not exist");
        require(p.state == ProposalState.Active, "TreasuryContract: Proposal not active");
        require(block.timestamp > p.endTime, "TreasuryContract: Voting period is still ongoing");

        if (p.yesVotes > p.noVotes) {
            p.state = ProposalState.Approved;
            emit SpendingApproved(proposalId, p.amountINR, p.proposer, p.proposerStudentId);
        } else {
            p.state = ProposalState.Rejected;
            emit SpendingRejected(proposalId, p.yesVotes, p.noVotes);
        }
    }

    /**
     * @notice Release demo/simulated tokens for academic demonstration.
     * Clearly labeled as a simulation. Does not touch or transfer real fiat money.
     */
    function releaseDemoFunds(uint256 proposalId) external onlyTreasurerOrOfficer {
        SpendingProposal storage p = proposals[proposalId];
        require(p.exists, "TreasuryContract: Proposal does not exist");
        require(p.state == ProposalState.Approved, "TreasuryContract: Proposal must be Approved first");
        require(!p.demoFundsReleased, "TreasuryContract: Demo funds already released");

        p.demoFundsReleased = true;
        p.state = ProposalState.Executed;

        emit DemoFundsReleased(proposalId, p.amountINR, p.proposer);
    }

    function getSpendingProposal(uint256 proposalId) external view returns (
        uint256 id,
        bytes32 contentHash,
        uint256 amountINR,
        address proposer,
        uint256 startTime,
        uint256 endTime,
        uint256 yesVotes,
        uint256 noVotes,
        ProposalState state,
        bool demoFundsReleased
    ) {
        SpendingProposal storage p = proposals[proposalId];
        require(p.exists, "TreasuryContract: Spending proposal does not exist");
        return (
            p.id,
            p.contentHash,
            p.amountINR,
            p.proposer,
            p.startTime,
            p.endTime,
            p.yesVotes,
            p.noVotes,
            p.state,
            p.demoFundsReleased
        );
    }

    function hasStudentVoted(uint256 proposalId, bytes32 studentId) external view returns (bool) {
        return hasVoted[proposalId][studentId];
    }
}
