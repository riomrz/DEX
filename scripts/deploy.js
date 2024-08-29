const { ethers } = require("hardhat");
const hre = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
    // Token deploy
    const Token = await hre.ethers.getContractFactory("Token");
    console.log("Deploying Token contract...");
    const token = await Token.deploy("CryptoDev LP Token", "CDLP", 1000000);
    await token.deployed();
    console.log("Token contract deployed @:", token.address);

    // DEX deploy
    const dexContract = await ethers.getContractFactory("DEX");
    const deployedDEXContract = await dexContract.deploy(
        token.address
    );
    await deployedDEXContract.deployed();
    console.log("DEX Contract Address:", deployedDEXContract.address);
}

// Call the main function and catch if there is any error
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });