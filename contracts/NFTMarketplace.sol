// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    uint256 public listingFee = 0.01 ether;

    struct NFT {
        uint256 tokenId;
        address payable owner;
        uint256 price;
        bool isListed;
    }

    mapping(uint256 => NFT) public nfts;

    event NFTMinted(uint256 tokenId, address owner, uint256 price, bool isListed);
    event NFTSold(uint256 tokenId, address buyer, uint256 price);
    event ListingFeeUpdated(uint256 newFee);

    constructor() ERC721("Decentralized Gaming NFT Marketplace", "DGNFT") {}

    // Mint and list an NFT
    function mintNFT(string memory tokenURI, uint256 price) external payable {
        require(msg.value == listingFee, "Must pay the listing fee to mint an NFT");
        require(price > 0, "Price must be greater than zero");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        nfts[newTokenId] = NFT(newTokenId, payable(msg.sender), price, true);

        emit NFTMinted(newTokenId, msg.sender, price, true);
    }

    // Buy a listed NFT
    function buyNFT(uint256 tokenId) external payable {
        NFT storage nft = nfts[tokenId];
        require(nft.isListed, "NFT is not listed for sale");
        require(msg.value == nft.price, "Incorrect price sent");

        // Transfer funds to the seller
        nft.owner.transfer(msg.value);

        // Update ownership and listing status
        _transfer(nft.owner, msg.sender, tokenId);
        nft.owner = payable(msg.sender);
        nft.isListed = false;

        emit NFTSold(tokenId, msg.sender, nft.price);
    }

    // Update the listing fee (only contract owner)
    function updateListingFee(uint256 newFee) external onlyOwner {
        listingFee = newFee;
        emit ListingFeeUpdated(newFee);
    }

    // Withdraw accumulated fees (only contract owner)
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Get details of a specific NFT
    function getNFTDetails(uint256 tokenId) external view returns (NFT memory) {
        return nfts[tokenId];
    }
}