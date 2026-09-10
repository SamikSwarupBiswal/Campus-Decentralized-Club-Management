// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Campus DAO Treasury
/// @notice Holds Test POL and executes transfers authorized by CampusGovernor.
contract Treasury is Ownable, ReentrancyGuard {
    address public governor;
    mapping(uint256 proposalId => bool executed) public proposalExecuted;

    error InvalidGovernor();
    error GovernorAlreadySet();
    error OnlyGovernor();
    error ProposalAlreadyExecuted();
    error InvalidRecipient();
    error InsufficientBalance();
    error TransferFailed();

    event GovernorConfigured(address indexed governor);
    event FundsReceived(address indexed sender, uint256 amount);
    event GovernanceTransfer(
        uint256 indexed proposalId,
        address indexed recipient,
        uint256 amount
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    /// @notice One-time handoff to the deployed governor contract.
    function setGovernor(address newGovernor) external onlyOwner {
        if (newGovernor == address(0)) revert InvalidGovernor();
        if (governor != address(0)) revert GovernorAlreadySet();
        governor = newGovernor;
        emit GovernorConfigured(newGovernor);
    }

    function execute(
        uint256 proposalId,
        address payable recipient,
        uint256 amount
    ) external nonReentrant {
        if (msg.sender != governor) revert OnlyGovernor();
        if (proposalExecuted[proposalId]) revert ProposalAlreadyExecuted();
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount > address(this).balance) revert InsufficientBalance();

        proposalExecuted[proposalId] = true;
        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit GovernanceTransfer(proposalId, recipient, amount);
    }
}
