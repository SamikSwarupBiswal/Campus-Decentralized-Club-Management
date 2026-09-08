// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MembershipContract
 * @notice Manages student wallet authorization, role-based access control,
 * and Sybil mitigation (1 authorized wallet per verified student ID hash).
 */
contract MembershipContract {
    enum Role { None, Member, Officer, Treasurer, Admin }

    address public admin;

    // Mapping: wallet address => authorization status
    mapping(address => bool) public authorizedWallets;

    // Mapping: wallet address => hashed student identifier
    mapping(address => bytes32) public walletToStudentId;

    // Mapping: hashed student identifier => currently active wallet address
    mapping(bytes32 => address) public studentToActiveWallet;

    // Mapping: wallet address => role
    mapping(address => Role) public walletRoles;

    // Events
    event WalletAuthorized(address indexed wallet, bytes32 indexed studentIdHash);
    event WalletRevoked(address indexed wallet, bytes32 indexed studentIdHash);
    event WalletReplaced(address indexed oldWallet, address indexed newWallet, bytes32 indexed studentIdHash);
    event RoleUpdated(address indexed wallet, Role role);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "MembershipContract: Caller is not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
        walletRoles[msg.sender] = Role.Admin;
        authorizedWallets[msg.sender] = true;
    }

    /**
     * @notice Authorize a wallet for a verified student.
     * Enforces that the wallet is not already used and the student does not already have an active wallet.
     */
    function authorizeWallet(address wallet, bytes32 studentIdHash) external onlyAdmin {
        require(wallet != address(0), "Invalid wallet address");
        require(studentIdHash != bytes32(0), "Invalid student ID hash");
        require(!authorizedWallets[wallet], "Wallet is already authorized");
        require(studentToActiveWallet[studentIdHash] == address(0), "Student already has an active wallet");

        authorizedWallets[wallet] = true;
        walletToStudentId[wallet] = studentIdHash;
        studentToActiveWallet[studentIdHash] = wallet;

        if (walletRoles[wallet] == Role.None) {
            walletRoles[wallet] = Role.Member;
        }

        emit WalletAuthorized(wallet, studentIdHash);
    }

    /**
     * @notice Revoke a wallet (in case of compromise or loss).
     */
    function revokeWallet(address wallet) external onlyAdmin {
        require(authorizedWallets[wallet], "Wallet is not authorized");
        bytes32 studentIdHash = walletToStudentId[wallet];

        authorizedWallets[wallet] = false;
        studentToActiveWallet[studentIdHash] = address(0);

        emit WalletRevoked(wallet, studentIdHash);
    }

    /**
     * @notice Replace a lost or compromised wallet with a new one.
     * Note: Does NOT reset studentId voting history in governance/voting contracts.
     */
    function replaceWallet(address oldWallet, address newWallet) external onlyAdmin {
        require(authorizedWallets[oldWallet], "Old wallet is not authorized");
        require(newWallet != address(0), "Invalid new wallet");
        require(!authorizedWallets[newWallet], "New wallet already authorized");

        bytes32 studentIdHash = walletToStudentId[oldWallet];
        Role previousRole = walletRoles[oldWallet];

        // Revoke old wallet
        authorizedWallets[oldWallet] = false;

        // Authorize new wallet
        authorizedWallets[newWallet] = true;
        walletToStudentId[newWallet] = studentIdHash;
        studentToActiveWallet[studentIdHash] = newWallet;
        walletRoles[newWallet] = previousRole;

        emit WalletReplaced(oldWallet, newWallet, studentIdHash);
    }

    /**
     * @notice Assign a specific role to a wallet.
     */
    function setRole(address wallet, Role role) external onlyAdmin {
        require(authorizedWallets[wallet], "Wallet must be authorized first");
        walletRoles[wallet] = role;
        emit RoleUpdated(wallet, role);
    }

    /**
     * @notice Transfer admin ownership.
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
        walletRoles[newAdmin] = Role.Admin;
        authorizedWallets[newAdmin] = true;
    }

    // View functions for other contracts
    function isAuthorized(address wallet) external view returns (bool) {
        return authorizedWallets[wallet];
    }

    function studentIdOf(address wallet) external view returns (bytes32) {
        return walletToStudentId[wallet];
    }

    function roleOf(address wallet) external view returns (Role) {
        return walletRoles[wallet];
    }
}
