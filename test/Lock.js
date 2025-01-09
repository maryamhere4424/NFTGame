const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
    let NFTMarketplace;
    let nftMarketplace;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
        [owner, addr1, addr2] = await ethers.getSigners();
        nftMarketplace = await NFTMarketplace.deploy();
        await nftMarketplace.deployed();
    });

    describe("Minting NFTs", function () {
        it("Should mint an NFT and list it", async function () {
            const tokenURI = "https://example.com/token/1";
            const price = ethers.utils.parseEther("0.1");

            await nftMarketplace.connect(addr1).mintNFT(tokenURI, price, { value: ethers.utils.parseEther("0.01") });

            const nftDetails = await nftMarketplace.getNFTDetails(1);
            expect(nftDetails.tokenId).to.equal(1);
            expect(nftDetails.owner).to.equal(addr1.address);
            expect(nftDetails.price).to.equal(price);
            expect(nftDetails.isListed).to.be.true;
        });

        it("Should fail if listing fee is not paid", async function () {
            const tokenURI = "https://example.com/token/2";
            const price = ethers.utils.parseEther("0.1");

            await expect(nftMarketplace.connect(addr1).mintNFT(tokenURI, price)).to.be.revertedWith("Must pay the listing fee to mint an NFT");
        });
    });

    describe("Buying NFTs", function () {
        beforeEach(async function () {
            const tokenURI = "https://example.com/token/3";
            const price = ethers.utils.parseEther("0.1");
            await nftMarketplace.connect(addr1).mintNFT(tokenURI, price, { value: ethers.utils.parseEther("0.01") });
        });

        it("Should allow a user to buy a listed NFT", async function () {
            const nftDetails = await nftMarketplace.getNFTDetails(1);
            await nftMarketplace.connect(addr2).buyNFT(1, { value: nftDetails.price });

            const newOwner = await nftMarketplace.getNFTDetails(1);
            expect(newOwner.owner).to.equal(addr2.address);
            expect(newOwner.isListed).to.be.false;
        });

        it("Should fail if the NFT is not listed", async function () {
            await nftMarketplace.connect(addr2).buyNFT(1, { value: ethers.utils.parseEther("0.1") });
            await expect(nftMarketplace.connect(addr1).buyNFT(1)).to.be.revertedWith("NFT is not listed for sale");
        });

        it("Should fail if incorrect price is sent", async function () {
            await expect(nftMarketplace.connect(addr2).buyNFT(1, { value: ethers.utils.parseEther("0.05") })).to.be.revertedWith("Incorrect price sent");
        });
    });

    describe("Updating Listing Fee", function () {
        it("Should allow the owner to update the listing fee", async function () {
            await nftMarketplace.updateListingFee(ethers.utils.parseEther("0.02"));
            expect(await nftMarketplace.listingFee()).to.equal(ethers.utils.parseEther("0.02"));
        });

        it("Should fail if a non-owner tries to update the listing fee", async function () {
            await expect(nftMarketplace.connect(addr1).updateListingFee(ethers.utils.parseEther("0.02"))).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Withdraw Funds", function () {
        it("Should allow the owner to withdraw funds", async function () {
            const tokenURI = "https://example.com/token/4";
            const price = ethers.utils.parseEther("0.1");
            await nftMarketplace.connect(addr1).mintNFT(tokenURI, price, { value: ethers.utils.parseEther("0.01") });
            await nftMarketplace.connect(addr2).buyNFT(1, { value: price });

            const initialBalance = await ethers.provider.getBalance(owner.address);
            await nftMarketplace.withdrawFunds();
            const finalBalance = await ethers.provider.getBalance(owner.address);

            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should fail if a non-owner tries to withdraw funds", async function () {
            await expect(nftMarketplace.connect(addr1).withdrawFunds()).to.be.revertedWith("Ownable: caller is not the owner");
        });