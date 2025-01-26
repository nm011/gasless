// contracts/ERC721Permit.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

abstract contract ERC721Permit is ERC721 {
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant PERMIT_TYPEHASH = 
        keccak256("Permit(address spender,uint256 tokenId,uint256 nonce,uint256 deadline)");
    
    mapping(uint256 => uint256) public nonces;
    
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function permit(
        address spender,
        uint256 tokenId,
        uint256 deadline,
        bytes memory signature
    ) public virtual {
        require(block.timestamp <= deadline, "Expired deadline");
        
        bytes32 digest = ECDSA.toTypedDataHash(
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(
                PERMIT_TYPEHASH,
                spender,
                tokenId,
                nonces[tokenId]++,
                deadline
            ))
        );
        
        address owner = ownerOf(tokenId);
        require(ECDSA.recover(digest, signature) == owner, "Invalid signature");
        
        _approve(spender, tokenId);
    }
}