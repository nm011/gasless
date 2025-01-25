// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract GaslessForwarder is EIP712 {
    using ECDSA for bytes32;

    // Define struct before usage
    struct ForwardRequest {
        address user;
        address target;
        bytes data;
        uint256 nonce;
        uint256 deadline;
    }

    bytes32 private constant _TYPEHASH =
        keccak256("ForwardRequest(address user,address target,bytes data,uint256 nonce,uint256 deadline)");

    mapping(address => uint256) public nonces;

    constructor() EIP712("GaslessForwarder", "1") {}

    // Fixed function signature
    function execute(
        ForwardRequest calldata req, // Use struct as parameter
        bytes calldata signature
    ) external {
        require(req.target != address(this), "Cannot call forwarder itself");
        require(req.deadline >= block.timestamp, "Expired deadline");
        
        uint256 currentNonce = nonces[req.user];
        require(req.nonce == currentNonce, "Invalid nonce");
        nonces[req.user] = currentNonce + 1;

        bytes32 structHash = keccak256(
            abi.encode(
                _TYPEHASH,
                req.user,
                req.target,
                keccak256(req.data),
                req.nonce,
                req.deadline
            )
        );
        
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);
        require(signer == req.user, "Invalid signature");

        (bool success, ) = req.target.call(req.data);
        require(success, "Transaction failed");
    }
}