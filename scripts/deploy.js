async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    // Get the contract factory
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  
    // Deploy the contract
    const nftMarketplace = await NFTMarketplace.deploy();
    console.log("NFTMarketplace contract deployed to:", nftMarketplace.address);
  
    // Optionally, you can also wait for the contract to be deployed and confirm
    await NFTMarketplace.deployed();
    console.log("NFTMarketplace contract is deployed and ready!");
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error deploying the contract:", error);
      process.exit(1);
    });
  