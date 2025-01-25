// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract GaslessForwarder {
    using ECDSA for bytes32;
    
    mapping(address => uint256) public nonces;

    function execute(
        address user,
        address target,
        bytes calldata data,
        bytes calldata signature
    ) external {
        // Verify nonce
        uint256 currentNonce = nonces[user]++;
        
        // Create message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                user,
                target,
                data,
                currentNonce,
                block.chainid
            )
        );
        
        // Verify signature
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == user, "Invalid signature");
        
        // Execute transaction
        (bool success, ) = target.call(data);
        require(success, "Transaction failed");
    }
}