// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract BlockOffAuthToken is ERC20, Ownable, EIP712 {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using ECDSA for bytes32;

    // -----------------------------
    // Constants
    // -----------------------------

    uint256 public constant TOTAL_SUPPLY = 1_000_000;

    bytes32 private constant TRANSFER_AUTH_TYPEHASH =
        keccak256(
            "TransferWithAuthorization(address from,address to,uint256 amount,uint256 validAfter,uint256 validBefore,bytes32 nonce)"
        );

    // -----------------------------
    // Storage
    // -----------------------------

    // authorizer => nonce => used
    mapping(address => mapping(bytes32 => bool)) private _usedAuthorizations;

    // -----------------------------
    // Events
    // -----------------------------

    event AuthorizationConsumed(address indexed from, bytes32 indexed nonce);

    // -----------------------------
    // Constructor
    // -----------------------------

    constructor(string memory name, string memory symbol)
        ERC20(name, symbol)
        Ownable(msg.sender)
        EIP712(name, "1")
    {
        _mint(msg.sender, TOTAL_SUPPLY * 10 ** decimals());
    }

    // -----------------------------
    // Gasless Transfer (EIP-3009 style)
    // -----------------------------

    function transferWithAuthorization(
        address from,
        address to,
        uint256 amount,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        bytes calldata signature
    ) external {
        require(block.timestamp >= validAfter, "Authorization not active");
        require(block.timestamp <= validBefore, "Authorization expired");
        require(!_usedAuthorizations[from][nonce], "Authorization already used");

        bytes32 structHash = keccak256(
            abi.encode(
                TRANSFER_AUTH_TYPEHASH,
                from,
                to,
                amount,
                validAfter,
                validBefore,
                nonce
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);

        require(signer == from, "Invalid authorization");

        // Mark authorization as used
        _usedAuthorizations[from][nonce] = true;

        // Execute transfer
        _transfer(from, to, amount);

        emit AuthorizationConsumed(from, nonce);
    }

    // -----------------------------
    // Controlled Mint (optional)
    // -----------------------------

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // -----------------------------
    // View helpers
    // -----------------------------

    function authorizationUsed(address user, bytes32 nonce)
        external
        view
        returns (bool)
    {
        return _usedAuthorizations[user][nonce];
    }
}
