// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Campus DAO Membership Registry
/// @notice Non-transferable governance eligibility for verified students.
contract MembershipRegistry is AccessControl {
    bytes32 public constant MEMBER_MANAGER_ROLE = keccak256("MEMBER_MANAGER_ROLE");

    mapping(address account => bool active) private _members;
    uint256 public memberCount;

    error InvalidMember();
    error AlreadyMember();
    error NotMember();

    event MemberRegistered(address indexed account);
    event MemberRevoked(address indexed account);

    constructor(address initialAdmin) {
        if (initialAdmin == address(0)) revert InvalidMember();
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(MEMBER_MANAGER_ROLE, initialAdmin);
    }

    function registerMember(address account) external onlyRole(MEMBER_MANAGER_ROLE) {
        if (account == address(0)) revert InvalidMember();
        if (_members[account]) revert AlreadyMember();
        _members[account] = true;
        unchecked {
            ++memberCount;
        }
        emit MemberRegistered(account);
    }

    function revokeMember(address account) external onlyRole(MEMBER_MANAGER_ROLE) {
        if (!_members[account]) revert NotMember();
        _members[account] = false;
        unchecked {
            --memberCount;
        }
        emit MemberRevoked(account);
    }

    function isMember(address account) external view returns (bool) {
        return _members[account];
    }
}
