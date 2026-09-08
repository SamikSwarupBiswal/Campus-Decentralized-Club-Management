// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MembershipContract.sol";

/**
 * @title VerificationContract
 * @notice Provides tamper-evident record verification (e.g., event attendance batches).
 *
 * HONEST LIMITATION STATEMENT:
 * Blockchain does NOT prove that the original attendance record was truthful.
 * It only proves that an accepted, signed record has not silently changed since its cryptographic hash was committed.
 * Raw personal data is kept OFF-CHAIN in Supabase; ONLY the keccak256 hash is anchored here.
 */
contract VerificationContract {
    MembershipContract public membership;

    struct Proof {
        bytes32 hash;
        uint256 timestamp;
        address issuer;
        bool exists;
    }

    // recordSetId => Proof
    mapping(bytes32 => Proof) public proofs;

    event ProofStored(bytes32 indexed recordSetId, bytes32 indexed hash, uint256 timestamp, address indexed issuer);

    modifier onlyOfficerOrAdmin() {
        require(membership.isAuthorized(msg.sender), "VerificationContract: Not authorized");
        MembershipContract.Role role = membership.roleOf(msg.sender);
        require(
            role == MembershipContract.Role.Officer ||
            role == MembershipContract.Role.Admin,
            "VerificationContract: Insufficient permissions"
        );
        _;
    }

    constructor(address _membershipAddress) {
        require(_membershipAddress != address(0), "Invalid membership address");
        membership = MembershipContract(_membershipAddress);
    }

    /**
     * @notice Store a cryptographic hash proof for a finalized record set.
     */
    function storeProof(bytes32 recordSetId, bytes32 hash) external onlyOfficerOrAdmin {
        require(recordSetId != bytes32(0), "Invalid recordSetId");
        require(hash != bytes32(0), "Invalid hash");
        require(!proofs[recordSetId].exists, "Proof for this recordSetId already exists");

        proofs[recordSetId] = Proof({
            hash: hash,
            timestamp: block.timestamp,
            issuer: msg.sender,
            exists: true
        });

        emit ProofStored(recordSetId, hash, block.timestamp, msg.sender);
    }

    /**
     * @notice Retrieve stored proof for a recordSetId.
     */
    function getProof(bytes32 recordSetId) external view returns (bytes32 hash, uint256 timestamp, address issuer) {
        require(proofs[recordSetId].exists, "Proof does not exist");
        Proof storage p = proofs[recordSetId];
        return (p.hash, p.timestamp, p.issuer);
    }

    /**
     * @notice Check whether a recalculated currentHash matches the on-chain anchor.
     */
    function verifyProof(bytes32 recordSetId, bytes32 currentHash) external view returns (bool) {
        if (!proofs[recordSetId].exists) {
            return false;
        }
        return proofs[recordSetId].hash == currentHash;
    }
}
