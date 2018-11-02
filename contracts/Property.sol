pragma solidity ^0.4.24;

import "./HelloWorld.sol";

contract Property is HelloWorld {
    address guest;
    bool occupied;

    function inviteGuest(address _guest) external onlyOwner returns (address) {
        guest = _guest;
        return _guest;
    }

    modifier onlyGuest {
        require(msg.sender == guest);
        _;
    }

    function reserveRoom() external payable onlyGuest returns (bool) {
        require(msg.value == 1 ether && !occupied, "Not enough funds were sent, please call the contract with 1 Ether");
        occupied = true;
        return true;
    }
}

// Owner should be able to set guest
// Non-owner should not be able to set guest
// Guest should be able to reserve room
// Non-guest should not be able to reserve room
// Second guest should not be able to reserve room if it is occupied
