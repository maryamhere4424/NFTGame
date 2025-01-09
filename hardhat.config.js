require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/InR6QE9UbummkQ-DWwlFKJNp3A9DtfGW",
      accounts: [
        "8cc54b673f33f48cc3af513b4941846ad6c9a982ca20b36cc0a7b02ad537e311"
      ],
      chainId: 11155111
    }
  },
  defaultNetwork: "sepolia"
};