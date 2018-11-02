pragma solidity ^0.4.24;

contract Ownable {
    constructor() public {
        owner = msg.sender; //deployer of contract
    }

    address internal owner;
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    function transferOwnership(address _owner) external onlyOwner returns (address) {
        owner = _owner;
        return owner;
    }
}