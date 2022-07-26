//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Land is ERC721 {

    uint256 public cost;
    uint8 public maxSupply = 5;
    uint8 public totalSupply = 0;

    struct Building {
        string name;
        address owner;
        int256 positionX;
        int256 positionY;
        int256 positionZ;
        int256 sizeX;
        int256 sizeY;
        int256 sizeZ;
    }

    Building[] public buildings;

    constructor(string memory _name, string memory _symbol, uint256 _cost) 
        ERC721(_name, _symbol){
            cost = _cost;
            buildings.push(
                Building("City Hall", address(0), 0, 0, 0, 10, 10, 10)
            );
            buildings.push(
                Building("Stadium", address(0), 0, 10, 0, 10, 5, 3)
            );
            buildings.push(
                Building("University", address(0), 0, -10, 0, 10, 5, 3)
            );
            buildings.push(
                Building("Shopping Plaza 1", address(0), 10, 0, 0, 5, 25, 5)
            );
            buildings.push(
                Building("Shopping Plaza 2", address(0), -10, 0, 0, 5, 25, 5)
            );
        }

        function mint(uint256 _id) public payable {
            require(totalSupply <= maxSupply, "No more land to buy");
            require(buildings[_id - 1].owner == address(0), "Land is already purchased");
            require(msg.value >= cost, "Not enough ether sent");

            buildings[_id - 1].owner = msg.sender;
            totalSupply++;
            _safeMint(msg.sender, _id);
        }

        function transferFrom(address _from, address _to, uint256 _tokenId) public override {
            require(_isApprovedOrOwner(msg.sender, _tokenId), "You are not approved or the owner");

            buildings[_tokenId - 1].owner = _to;

            _transfer(_from, _to, _tokenId);
        }

        function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory _data) public override {
            require(_isApprovedOrOwner(msg.sender, _tokenId), "You are not approved or the owner");

            buildings[_tokenId - 1].owner = _to;

            _safeTransfer(_from, _to, _tokenId, _data);
        }

        function getBuildings() public view returns (Building[] memory){
            return buildings;
        }

        function getBuilding(uint256 _id) public view returns (Building memory) {
            return buildings[_id - 1];
        }

}