// SPDX-License-Identifier: MIT
// Deployment script for Decentralized Gaming NFT Marketplace using Hardhat Ignition
const { buildModule } = require("@nomicfoundation/hardhat-ignition");

const NFTMarketplaceModule = buildModule("NFTMarketplaceModule", (m) => {
    // Deploy the main NFTMarketplace contract
    const nftMarketplace = m.contract("NFTMarketplace");

    // Initialize the marketplace with a listing fee
    const setupListingFee = m.call(nftMarketplace, "updateListingFee", [
        ethers.utils.parseEther("0.01") // Set listing fee to 0.01 ether
    ]);

    // Setup deployment dependency
    setupListingFee.after(nftMarketplace);

    return {
        nftMarketplace,
        setupListingFee
    };
});
module.exports = NFTMarketplaceModule;
