// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MembershipContract.sol";

/**
 * @title GovernanceContract
 * @notice Enforces transparent proposal lifecycle and member voting.
 * Rules are encoded in Solidity rather than subject to officer discretion.
 */
contract GovernanceContract {
    enum ProposalState { Active, Passed, Rejected, Executed }

    struct Proposal {
        uint256 id;
        bytes32 contentHash;      // keccak256 hash of proposal title, description, metadata
        address proposer;
        bytes32 proposerStudentId;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        ProposalState state;
        bool exists;
    }

    MembershipContract public membership;

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    // proposalId => studentIdHash => hasVoted
    mapping(uint256 => mapping(bytes32 => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, bytes32 indexed contentHash, address indexed proposer, uint256 startTime, uint256 endTime);
    event ProposalVoted(uint256 indexed proposalId, bytes32 indexed studentIdHash, bool support, address voter);
    event ProposalFinalized(uint256 indexed proposalId, ProposalState state, uint256 yesVotes, uint256 noVotes);
    event ProposalExecuted(uint256 indexed proposalId);

    modifier onlyOfficerOrAdmin() {
        require(membership.isAuthorized(msg.sender), "GovernanceContract: Not authorized");
        MembershipContract.Role role = membership.roleOf(msg.sender);
        require(
            role == MembershipContract.Role.Officer || role == MembershipContract.Role.Admin,
            "GovernanceContract: Insufficient permissions (Officer or Admin required)"
        );
        _;
    }

    constructor(address _membershipAddress) {
        require(_membershipAddress != address(0), "Invalid membership address");
        membership = MembershipContract(_membershipAddress);
    }

    /**
     * @notice Create a new governance proposal with an immutable content hash.
     */
    function createProposal(
        bytes32 contentHash,
        uint256 votingPeriod
    ) external onlyOfficerOrAdmin returns (uint256) {
        require(contentHash != bytes32(0), "Invalid content hash");
        require(votingPeriod >= 60, "Voting period must be at least 60 seconds");

        proposalCount++;
        uint256 pId = proposalCount;

        bytes32 studentId = membership.studentIdOf(msg.sender);

        proposals[pId] = Proposal({
            id: pId,
            contentHash: contentHash,
            proposer: msg.sender,
            proposerStudentId: studentId,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            yesVotes: 0,
            noVotes: 0,
            state: ProposalState.Active,
            exists: true
        });

        emit ProposalCreated(pId, contentHash, msg.sender, block.timestamp, block.timestamp + votingPeriod);
        return pId;
    }

    /**
     * @notice Cast a Yes (true) or No (false) vote on an active proposal.
     */
    function voteOnProposal(uint256 proposalId, bool support) external {
        require(membership.isAuthorized(msg.sender), "GovernanceContract: Wallet not authorized");

        Proposal storage p = proposals[proposalId];
        require(p.exists, "GovernanceContract: Proposal does not exist");
        require(p.state == ProposalState.Active, "GovernanceContract: Proposal is not active");
        require(block.timestamp <= p.endTime, "GovernanceContract: Voting window has closed");

        bytes32 studentId = membership.studentIdOf(msg.sender);
        require(studentId != bytes32(0), "GovernanceContract: No student ID linked");
        require(!hasVoted[proposalId][studentId], "GovernanceContract: Already voted on this proposal");

        hasVoted[proposalId][studentId] = true;

        if (support) {
            p.yesVotes++;
        } else {
            p.noVotes++;
        }

        emit ProposalVoted(proposalId, studentId, support, msg.sender);
    }

    /**
     * @notice Finalize proposal once voting period concludes.
     * Passes if yesVotes > noVotes.
     */
    function finalizeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(p.exists, "GovernanceContract: Proposal does not exist");
        require(p.state == ProposalState.Active, "GovernanceContract: Proposal not active");
        require(block.timestamp > p.endTime, "GovernanceContract: Voting period is still ongoing");

        if (p.yesVotes > p.noVotes) {
            p.state = ProposalState.Passed;
        } else {
            p.state = ProposalState.Rejected;
        }

        emit ProposalFinalized(proposalId, p.state, p.yesVotes, p.noVotes);
    }

    /**
     * @notice Mark a passed proposal as executed by club officer/admin.
     */
    function executeProposal(uint256 proposalId) external onlyOfficerOrAdmin {
        Proposal storage p = proposals[proposalId];
        require(p.exists, "GovernanceContract: Proposal does not exist");
        require(p.state == ProposalState.Passed, "GovernanceContract: Proposal must be in Passed state to execute");

        p.state = ProposalState.Executed;
        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        bytes32 contentHash,
        address proposer,
        uint256 startTime,
        uint256 endTime,
        uint256 yesVotes,
        uint256 noVotes,
        ProposalState state
    ) {
        Proposal storage p = proposals[proposalId];
        require(p.exists, "GovernanceContract: Proposal does not exist");
        return (p.id, p.contentHash, p.proposer, p.startTime, p.endTime, p.yesVotes, p.noVotes, p.state);
    }

    function hasStudentVoted(uint256 proposalId, bytes32 studentId) external view returns (bool) {
        return hasVoted[proposalId][studentId];
    }
}
