// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MembershipContract.sol";

/**
 * @title VotingContract
 * @notice Handles college club elections with tamper-evident vote recording.
 * Enforces one vote per verified studentIdHash (even across wallet replacement).
 */
contract VotingContract {
    MembershipContract public membership;

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string title;
        uint256 startTime;
        uint256 endTime;
        bool exists;
        uint256[] candidateIds;
        uint256 totalVotes;
    }

    uint256 public electionCount;
    mapping(uint256 => Election) public elections;
    // electionId => candidateId => Candidate
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    // electionId => studentIdHash => hasVoted
    mapping(uint256 => mapping(bytes32 => bool)) public hasVoted;

    event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, bytes32 indexed studentIdHash, address voter);

    modifier onlyOfficerOrAdmin() {
        require(membership.isAuthorized(msg.sender), "VotingContract: Not authorized");
        MembershipContract.Role role = membership.roleOf(msg.sender);
        require(
            role == MembershipContract.Role.Officer || role == MembershipContract.Role.Admin,
            "VotingContract: Insufficient permissions (Officer or Admin required)"
        );
        _;
    }

    constructor(address _membershipAddress) {
        require(_membershipAddress != address(0), "Invalid membership address");
        membership = MembershipContract(_membershipAddress);
    }

    /**
     * @notice Create a new election with bounded start/end times and candidate list.
     */
    function createElection(
        string calldata title,
        uint256 startTime,
        uint256 endTime,
        uint256[] calldata candidateIds,
        string[] calldata candidateNames
    ) external onlyOfficerOrAdmin returns (uint256) {
        require(startTime < endTime, "Invalid time window: start must be before end");
        require(candidateIds.length > 1, "Must have at least 2 candidates");
        require(candidateIds.length == candidateNames.length, "Candidates arrays length mismatch");

        electionCount++;
        uint256 newElectionId = electionCount;

        Election storage e = elections[newElectionId];
        e.id = newElectionId;
        e.title = title;
        e.startTime = startTime;
        e.endTime = endTime;
        e.exists = true;
        e.candidateIds = candidateIds;

        for (uint256 i = 0; i < candidateIds.length; i++) {
            uint256 cId = candidateIds[i];
            candidates[newElectionId][cId] = Candidate({
                id: cId,
                name: candidateNames[i],
                voteCount: 0
            });
        }

        emit ElectionCreated(newElectionId, title, startTime, endTime);
        return newElectionId;
    }

    /**
     * @notice Cast a vote for a candidate in an active election.
     * Enforces: wallet is authorized, election is active, student hasn't already voted.
     */
    function vote(uint256 electionId, uint256 candidateId) external {
        require(membership.isAuthorized(msg.sender), "VotingContract: Wallet not authorized");

        Election storage e = elections[electionId];
        require(e.exists, "VotingContract: Election does not exist");
        require(block.timestamp >= e.startTime, "VotingContract: Election has not started yet");
        require(block.timestamp <= e.endTime, "VotingContract: Election has ended");

        bytes32 studentIdHash = membership.studentIdOf(msg.sender);
        require(studentIdHash != bytes32(0), "VotingContract: No student ID linked");
        require(!hasVoted[electionId][studentIdHash], "VotingContract: Student has already voted in this election");

        require(candidates[electionId][candidateId].id == candidateId, "VotingContract: Invalid candidate ID");

        // Record vote (Checks-Effects-Interactions)
        hasVoted[electionId][studentIdHash] = true;
        candidates[electionId][candidateId].voteCount++;
        e.totalVotes++;

        emit VoteCast(electionId, candidateId, studentIdHash, msg.sender);
    }

    /**
     * @notice Check if a student has voted in an election.
     */
    function hasStudentVoted(uint256 electionId, bytes32 studentIdHash) external view returns (bool) {
        return hasVoted[electionId][studentIdHash];
    }

    /**
     * @notice Fetch candidates and their vote counts for an election.
     */
    function getResults(uint256 electionId) external view returns (
        uint256[] memory ids,
        string[] memory names,
        uint256[] memory voteCounts
    ) {
        Election storage e = elections[electionId];
        require(e.exists, "VotingContract: Election does not exist");

        uint256 len = e.candidateIds.length;
        ids = new uint256[](len);
        names = new string[](len);
        voteCounts = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            uint256 cId = e.candidateIds[i];
            Candidate storage c = candidates[electionId][cId];
            ids[i] = c.id;
            names[i] = c.name;
            voteCounts[i] = c.voteCount;
        }

        return (ids, names, voteCounts);
    }

    /**
     * @notice Returns election details.
     */
    function getElection(uint256 electionId) external view returns (
        uint256 id,
        string memory title,
        uint256 startTime,
        uint256 endTime,
        uint256 totalVotes,
        uint256[] memory candidateIds
    ) {
        Election storage e = elections[electionId];
        require(e.exists, "VotingContract: Election does not exist");
        return (e.id, e.title, e.startTime, e.endTime, e.totalVotes, e.candidateIds);
    }
}
