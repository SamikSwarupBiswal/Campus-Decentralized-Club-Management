// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Campus DAO Attendance Proof Registry
/// @notice Stores one immutable attendance fingerprint for each finalized event.
contract AttendanceRegistry is AccessControl {
    bytes32 public constant FINALIZER_ROLE = keccak256("FINALIZER_ROLE");

    struct AttendanceProof {
        bytes32 attendanceHash;
        uint64 finalizedAt;
        address finalizer;
    }

    mapping(bytes32 eventId => AttendanceProof proof) private _proofs;

    error InvalidEventId();
    error InvalidAttendanceHash();
    error EventAlreadyFinalized();

    event AttendanceFinalized(
        bytes32 indexed eventId,
        bytes32 indexed attendanceHash,
        uint64 finalizedAt,
        address indexed finalizer
    );

    constructor(address initialAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(FINALIZER_ROLE, initialAdmin);
    }

    function finalizeAttendance(
        bytes32 eventId,
        bytes32 attendanceHash
    ) external onlyRole(FINALIZER_ROLE) {
        if (eventId == bytes32(0)) revert InvalidEventId();
        if (attendanceHash == bytes32(0)) revert InvalidAttendanceHash();
        if (_proofs[eventId].finalizedAt != 0) {
            revert EventAlreadyFinalized();
        }

        uint64 finalizedAt = uint64(block.timestamp);
        _proofs[eventId] = AttendanceProof({
            attendanceHash: attendanceHash,
            finalizedAt: finalizedAt,
            finalizer: msg.sender
        });

        emit AttendanceFinalized(
            eventId,
            attendanceHash,
            finalizedAt,
            msg.sender
        );
    }

    function getProof(
        bytes32 eventId
    ) external view returns (AttendanceProof memory) {
        return _proofs[eventId];
    }

    function verifyAttendance(
        bytes32 eventId,
        bytes32 candidateHash
    ) external view returns (bool) {
        AttendanceProof storage proof = _proofs[eventId];
        return
            proof.finalizedAt != 0 &&
            proof.attendanceHash == candidateHash;
    }
}
