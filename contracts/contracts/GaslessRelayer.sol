// SPDX-License-Identifier: MIT
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
    
    mapping(address => uint256) private nonces;

    bytes4 private constant ERC20_PERMIT_SELECTOR = bytes4(keccak256("permit(address,address,uint256,uint256,uint8,bytes32,bytes32)"));
    bytes4 private constant ERC721_PERMIT_SELECTOR = bytes4(keccak256("permit(address,uint256,uint256,bytes)"));
    bytes4 private constant ERC20_TRANSFERFROM_SELECTOR = bytes4(keccak256("transferFrom(address,address,uint256)"));
    bytes4 private constant ERC721_SAFE_TRANSFERFROM_SELECTOR = bytes4(keccak256("safeTransferFrom(address,address,uint256)"));

    constructor() {}

    function execute(
        ForwardRequest calldata req,
        bytes calldata signature
    ) external {
        require(req.deadline >= block.timestamp, "Expired");
        require(req.nonce == nonces[req.user], "Invalid nonce");
        nonces[req.user] = req.nonce + 1;
        
        bytes32 digest = _hashTypedData(req);
        address signer = recover(digest, signature);
        require(signer == req.user, "Invalid signature");

        // Decode batched calls
        (bytes[] memory calls) = abi.decode(req.data, (bytes[]));
        require(calls.length == 2, "Invalid calls length");

        // Validate function selectors
        require(_isValidPermitSelector(calls[0]), "Invalid permit call");
        require(_isValidTransferSelector(calls[1]), "Invalid transfer call");

        // Execute permit
        (bool success, bytes memory returnData) = req.target.call(calls[0]);
        require(success, _getRevertMsg(returnData));

        // Execute transfer
        (success, returnData) = req.target.call(calls[1]);
        require(success, _getRevertMsg(returnData));
    }

    function _isValidPermitSelector(bytes memory callData) private pure returns (bool) {
        bytes4 selector = _extractSelector(callData);
        return selector == ERC20_PERMIT_SELECTOR || selector == ERC721_PERMIT_SELECTOR;
    }

    function _isValidTransferSelector(bytes memory callData) private pure returns (bool) {
        bytes4 selector = _extractSelector(callData);
        return selector == ERC20_TRANSFERFROM_SELECTOR || selector == ERC721_SAFE_TRANSFERFROM_SELECTOR;
    }

    function _extractSelector(bytes memory data) private pure returns (bytes4 selector) {
        assembly {
            selector := mload(add(data, 0x20))
        }
    }

    function _getRevertMsg(bytes memory returnData) internal pure returns (string memory) {
        if (returnData.length < 68) return "Call failed without revert message";
        assembly {
            returnData := add(returnData, 0x04)
        }
        return abi.decode(returnData, (string));
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
