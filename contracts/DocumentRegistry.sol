// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentRegistry
 * @dev Cryptographic document integrity registration ledger.
 * Records SHA-256 digests on-chain with submitter identity and timestamp
 * to provide tamper-evident verification.
 */
contract DocumentRegistry {
    struct DocumentRecord {
        bytes32 documentHash;
        address submitter;
        uint256 registeredAt;
        string docReference;
        uint256 blockNumber;
        bool exists;
    }

    // Owner / Administrator of the contract
    address public owner;

    // Mapping from document SHA-256 hash (bytes32) to record
    mapping(bytes32 => DocumentRecord) private records;

    // Total count of registered documents
    uint256 public totalRegistered;

    // Events
    event DocumentRegistered(
        bytes32 indexed documentHash,
        address indexed submitter,
        uint256 registeredAt,
        string docReference,
        uint256 blockNumber
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "DocumentRegistry: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Registers a new document hash.
     * @dev Reverts if the hash has already been registered to enforce uniqueness.
     * @param documentHash The 32-byte SHA-256 hash of the document.
     * @param docReference An application-level reference or metadata tracking identifier.
     */
    function registerDocument(bytes32 documentHash, string calldata docReference) external {
        require(documentHash != bytes32(0), "DocumentRegistry: document hash cannot be zero");
        require(!records[documentHash].exists, "DocumentRegistry: document hash already registered");

        records[documentHash] = DocumentRecord({
            documentHash: documentHash,
            submitter: msg.sender,
            registeredAt: block.timestamp,
            docReference: docReference,
            blockNumber: block.number,
            exists: true
        });

        totalRegistered += 1;

        emit DocumentRegistered(
            documentHash,
            msg.sender,
            block.timestamp,
            docReference,
            block.number
        );
    }

    /**
     * @notice Verifies if a given document hash is registered on-chain.
     * @param documentHash The 32-byte SHA-256 hash to query.
     * @return exists True if registered, false otherwise.
     * @return submitter Address that registered the document.
     * @return registeredAt Block timestamp of registration.
     * @return docReference Reference string associated with registration.
     * @return blockNumber Block number at which the registration transaction was mined.
     */
    function verifyDocument(bytes32 documentHash)
        external
        view
        returns (
            bool exists,
            address submitter,
            uint256 registeredAt,
            string memory docReference,
            uint256 blockNumber
        )
    {
        DocumentRecord memory record = records[documentHash];
        return (
            record.exists,
            record.submitter,
            record.registeredAt,
            record.docReference,
            record.blockNumber
        );
    }

    /**
     * @notice Checks existence only.
     * @param documentHash The SHA-256 hash.
     * @return bool True if registered.
     */
    function isRegistered(bytes32 documentHash) external view returns (bool) {
        return records[documentHash].exists;
    }

    /**
     * @notice Transfers ownership to a new address.
     * @param newOwner Address of the new owner.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "DocumentRegistry: new owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

