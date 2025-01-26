// SPDX-License-Identifier: MIT
// GaslessRelayer.sol
pragma solidity ^0.8.28;

contract GaslessRelayer {
    struct ForwardRequest {
        address user;
        address target;
        bytes data;
        uint256 nonce;
        uint256 deadline;
    }

    bytes32 private immutable _TYPEHASH = 
        keccak256("ForwardRequest(address user,address target,bytes data,uint256 nonce,uint256 deadline)");
    
    mapping(address => uint256) public nonces;

    constructor() {}

    function execute(
        ForwardRequest calldata req,
        bytes calldata signature
    ) external {
        require(req.deadline >= block.timestamp, "Expired");
        require(req.nonce == nonces[req.user], "Invalid nonce");
        nonces[req.user]++;
        
        bytes32 digest = _hashTypedData(req);
        address signer = recover(digest, signature);
        require(signer == req.user, "Invalid signature");

        // Decode batched calls
        bytes[] memory calls = abi.decode(req.data, (bytes[]));
        
        // Execute all calls in sequence
        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, ) = req.target.call(calls[i]);
            require(success, "Call failed");
        }
    }

    function _hashTypedData(ForwardRequest calldata req) private view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                _domainSeparator(),
                keccak256(
                    abi.encode(
                        _TYPEHASH,
                        req.user,
                        req.target,
                        keccak256(req.data),
                        req.nonce,
                        req.deadline
                    )
                )
            )
        );
    }

    function _domainSeparator() private view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("GaslessRelayer"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
    }

    function recover(bytes32 digest, bytes calldata signature) private pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(digest, v, r, s);
    }

    function splitSignature(bytes calldata sig) private pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 0x20))
            v := byte(0, calldataload(add(sig.offset, 0x40)))
        }
        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Invalid signature");
    }

    function getTypedDataHash(ForwardRequest calldata req) external view returns (bytes32) {
        return _hashTypedData(req);
    }

}