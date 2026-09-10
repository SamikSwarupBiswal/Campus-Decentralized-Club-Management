// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMembershipRegistry {
    function isMember(address account) external view returns (bool);
    function memberCount() external view returns (uint256);
}

interface ITreasury {
    function execute(
        uint256 proposalId,
        address payable recipient,
        uint256 amount
    ) external;
}

/// @title Campus DAO Governor
/// @notice One-member-one-vote governance with immutable quorum and approval rules.
contract CampusGovernor {
    uint256 public constant QUORUM_PERCENT = 30;
    uint256 public constant APPROVAL_PERCENT = 60;
    uint64 public constant MIN_VOTING_BLOCKS = 10;
    uint64 public constant MAX_VOTING_BLOCKS = 403_200;

    enum ProposalState {
        Pending,
        Active,
        Defeated,
        Passed,
        Executed
    }

    struct Proposal {
        bytes32 metadataHash;
        address proposer;
        address payable recipient;
        uint256 amount;
        uint64 startBlock;
        uint64 endBlock;
        uint128 memberSnapshot;
        uint128 yesVotes;
        uint128 noVotes;
        uint128 abstainVotes;
        bool executed;
    }

    IMembershipRegistry public immutable membership;
    ITreasury public immutable treasury;
    uint256 public proposalCount;

    mapping(uint256 proposalId => Proposal proposal) private _proposals;
    mapping(uint256 proposalId => mapping(address voter => bool voted)) public hasVoted;

    error OnlyMember();
    error InvalidMetadataHash();
    error InvalidVotingPeriod();
    error InvalidTreasuryRequest();
    error ProposalNotActive();
    error ProposalNotPassed();
    error AlreadyVoted();
    error InvalidVoteType();
    error NoMembersRegistered();

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        bytes32 indexed metadataHash,
        address recipient,
        uint256 amount,
        uint64 startBlock,
        uint64 endBlock,
        uint128 memberSnapshot
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint8 support
    );
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed recipient,
        uint256 amount
    );

    constructor(address membershipRegistry, address treasuryAddress) {
        if (
            membershipRegistry == address(0) ||
            treasuryAddress == address(0)
        ) revert InvalidTreasuryRequest();
        membership = IMembershipRegistry(membershipRegistry);
        treasury = ITreasury(treasuryAddress);
    }

    function createProposal(
        bytes32 metadataHash,
        address payable recipient,
        uint256 amount,
        uint64 votingBlocks
    ) external returns (uint256 proposalId) {
        if (!membership.isMember(msg.sender)) revert OnlyMember();
        if (metadataHash == bytes32(0)) revert InvalidMetadataHash();
        if (
            votingBlocks < MIN_VOTING_BLOCKS ||
            votingBlocks > MAX_VOTING_BLOCKS
        ) revert InvalidVotingPeriod();
        if ((amount == 0) != (recipient == address(0))) {
            revert InvalidTreasuryRequest();
        }

        // Freeze the member count so later registrations cannot move the quorum.
        uint256 members = membership.memberCount();
        if (members == 0) revert NoMembersRegistered();

        proposalId = ++proposalCount;
        uint64 startBlock = uint64(block.number);
        uint64 endBlock = startBlock + votingBlocks;
        _proposals[proposalId] = Proposal({
            metadataHash: metadataHash,
            proposer: msg.sender,
            recipient: recipient,
            amount: amount,
            startBlock: startBlock,
            endBlock: endBlock,
            memberSnapshot: uint128(members),
            yesVotes: 0,
            noVotes: 0,
            abstainVotes: 0,
            executed: false
        });

        emit ProposalCreated(
            proposalId,
            msg.sender,
            metadataHash,
            recipient,
            amount,
            startBlock,
            endBlock,
            uint128(members)
        );
    }

    /// @param support 0 = NO, 1 = YES, 2 = ABSTAIN.
    function castVote(uint256 proposalId, uint8 support) external {
        if (!membership.isMember(msg.sender)) revert OnlyMember();
        if (state(proposalId) != ProposalState.Active) {
            revert ProposalNotActive();
        }
        if (hasVoted[proposalId][msg.sender]) revert AlreadyVoted();
        if (support > 2) revert InvalidVoteType();

        hasVoted[proposalId][msg.sender] = true;
        Proposal storage proposal = _proposals[proposalId];
        if (support == 0) {
            ++proposal.noVotes;
        } else if (support == 1) {
            ++proposal.yesVotes;
        } else {
            ++proposal.abstainVotes;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    function execute(uint256 proposalId) external {
        if (state(proposalId) != ProposalState.Passed) {
            revert ProposalNotPassed();
        }
        Proposal storage proposal = _proposals[proposalId];
        proposal.executed = true;
        // Mark first, then call the treasury. A failed transfer rolls this back.
        if (proposal.amount > 0) {
            treasury.execute(
                proposalId,
                proposal.recipient,
                proposal.amount
            );
        }
        emit ProposalExecuted(
            proposalId,
            proposal.recipient,
            proposal.amount
        );
    }

    function state(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage proposal = _proposals[proposalId];
        if (proposal.proposer == address(0)) return ProposalState.Pending;
        if (proposal.executed) return ProposalState.Executed;
        if (block.number <= proposal.endBlock) return ProposalState.Active;

        // ABSTAIN counts for turnout, but not for YES approval.
        uint256 participation =
            uint256(proposal.yesVotes) +
            uint256(proposal.noVotes) +
            uint256(proposal.abstainVotes);
        bool quorumReached =
            participation * 100 >=
            uint256(proposal.memberSnapshot) * QUORUM_PERCENT;
        uint256 decisiveVotes =
            uint256(proposal.yesVotes) +
            uint256(proposal.noVotes);
        bool approvalReached =
            decisiveVotes > 0 &&
            uint256(proposal.yesVotes) * 100 >=
            decisiveVotes * APPROVAL_PERCENT;

        return
            quorumReached && approvalReached
                ? ProposalState.Passed
                : ProposalState.Defeated;
    }

    function getProposal(
        uint256 proposalId
    ) external view returns (Proposal memory) {
        return _proposals[proposalId];
    }
}
