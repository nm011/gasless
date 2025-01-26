// contracts/TestNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * EIP-4494 style permit for ERC-721
 * Reference: https://eips.ethereum.org/EIPS/eip-4494
 */
contract TestNFT is ERC721 {
    using ECDSA for bytes32;

    // Track nonces for each tokenId (EIP-4494 style)
    mapping(uint256 => uint256) public nonces;

    // keccak256("Permit(address spender,uint256 tokenId,uint256 nonce,uint256 deadline)");
    bytes32 public constant PERMIT_TYPEHASH =
        keccak256("Permit(address spender,uint256 tokenId,uint256 nonce,uint256 deadline)");

    // Store a name/version for EIP-712 domain
    string private constant NAME = "TestNFT";
    string private constant VERSION = "1";

    constructor() ERC721(NAME, "TNFT") {}

    // ============================================================
    // Mint logic for testing
    // ============================================================
    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    // Example to mint multiple tokens to the caller
    function mintSome() public {
        for (uint256 i = 1; i <= 5; i++) {
            _mint(msg.sender, i);
        }
    }

    // ============================================================
    // Permit logic (EIP-4494)
    // ============================================================
    function permit(
        address spender,
        uint256 tokenId,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "Permit: expired deadline");

        // Current nonce for this token
        uint256 currentNonce = nonces[tokenId];

        // Build the struct hash
        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                spender,
                tokenId,
                currentNonce,
                deadline
            )
        );

        // EIP-712 final hash
        bytes32 hash = _hashTypedDataV4(structHash);

        // Recover the signer who must be the token's owner
        address signer = hash.recover(signature);
        require(signer == ownerOf(tokenId), "Permit: invalid signature");

        // Increment nonce to prevent reuse
        nonces[tokenId] = currentNonce + 1;

        // Approve the spender
        _approve(spender, tokenId);
    }

    // ============================================================
    // EIP-712 Domain Separator
    // ============================================================
    function _domainSeparatorV4() internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(NAME)),
                keccak256(bytes(VERSION)),
                block.chainid,
                address(this)
            )
        );
    }

    function _hashTypedDataV4(bytes32 structHash) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked("\x19\x01", _domainSeparatorV4(), structHash)
        );
    }
}
