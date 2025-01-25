// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

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
        uint256 currentNonce = nonces[user]++;
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                user,
                target,
                data,
                currentNonce,
                block.chainid
            )
        );
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        require(signer == user, "Invalid signature");
        (bool success, ) = target.call(data);
        require(success, "Transaction failed");
    }
}
