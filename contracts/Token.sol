// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Token is ERC20 {

    constructor(string memory _tokenName,
            string memory _tokenSymbol,
            uint256 _supply) ERC20(_tokenName, _tokenSymbol) {
        _mint(msg.sender, _supply);
    }
}
