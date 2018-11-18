pragma solidity ^0.4.24;

import "../node_modules/zeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract PropertyRegistry {
    
    ERC20 propertyToken;
    ERC721Basic propertyContract;

    struct Data {
        uint256 stays;
        uint256 price;
        address requested;
        address approved;
        address occupant;
        uint256 checkIn;
        uint256 checkOut;
        string uri;
    }

    mapping(uint256 => Data) propertyDetails;

    modifier onlyOwner(uint256 _tokenId) {
        require(propertyContract.ownerOf(_tokenId) == msg.sender, "Non-owner is trying to access owner only function");
        _;
    }

    modifier notRequested(uint256 _tokenId){
        require(propertyDetails[_tokenId].requested == address(0), "Requested must be empty");
        _;
    }

    constructor(address _propertyContract, address _propertyToken) public {
        propertyContract = ERC721Basic(_propertyContract);
        propertyToken = ERC20(_propertyToken);
    }

    function getPropertyDetails(uint256 _tokenId) public view returns (uint256, string){
        return (
            propertyDetails[_tokenId].price,
            propertyDetails[_tokenId].uri
        );
    }

    function registerProperty(uint256 _tokenId, uint256 _price, string _uri) public onlyOwner(_tokenId){
        propertyDetails[_tokenId] = Data(0, _price, address(0), address(0), address(0), 0, 0, _uri);
    }

    function requestStay(uint256 _tokenId, uint256 _checkIn, uint256 _checkOut) public notRequested(_tokenId){
        propertyDetails[_tokenId].requested = msg.sender;
        propertyDetails[_tokenId].checkIn = _checkIn;
        propertyDetails[_tokenId].checkOut = _checkOut;
    }

    function approveRequest(uint256 _tokenId) public onlyOwner(_tokenId) {
        propertyDetails[_tokenId].approved = propertyDetails[_tokenId].requested;
    }

    function checkIn(uint256 _tokenId) public {
        require(propertyDetails[_tokenId].approved == msg.sender, "Guest is not approved");
        require(now > propertyDetails[_tokenId].checkIn, "Check in time must be prior to now");
        require(propertyToken.transferFrom(msg.sender, address(this), propertyDetails[_tokenId].price), "Must succesfully pay for room");
        propertyDetails[_tokenId].occupant = propertyDetails[_tokenId].approved;
    }

    function checkOut(uint _tokenId) public {
        require(propertyDetails[_tokenId].occupant == msg.sender, "Must be occupant to checkout");
        require(
            propertyToken.transfer(propertyContract.ownerOf(_tokenId), propertyDetails[_tokenId].price), 
            "Contract must successfully transfer to owner"
        );
        propertyDetails[_tokenId].requested = address(0);
        propertyDetails[_tokenId].stays++;
    }

    // =============================
    // View functions for Owner
    // =============================

    function ownerGetStays(uint256 _tokenId) public view onlyOwner(_tokenId) returns (uint256){
        return propertyDetails[_tokenId].stays;
    }
    function ownerGetBookingDetails(uint256 _tokenId) public view onlyOwner(_tokenId) 
    returns (
        address,
        address,
        address,
        uint256,
        uint256
    ){
        return (
            propertyDetails[_tokenId].requested,
            propertyDetails[_tokenId].approved,
            propertyDetails[_tokenId].occupant,
            propertyDetails[_tokenId].checkIn,
            propertyDetails[_tokenId].checkOut
        );
    }
}