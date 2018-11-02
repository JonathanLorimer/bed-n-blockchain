pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract HelloWorld is Ownable {    

    event Hello(string _msg);

    function hello (string _msg) external onlyOwner{
        emit Hello(_msg); //note emit keyword
    }

    
}