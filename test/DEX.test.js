require("dotenv").config();
const { expect } = require("chai");
const { BigNumber, constants } = require('ethers');
const { AddressZero } = constants;


describe('DEX', function (accounts) {

    it('system setup', async function () {
        [testOwner, user1, user2, user3] = await ethers.getSigners();

        const Token = await hre.ethers.getContractFactory("Token");
        token = await Token.deploy("CryptoDev LP Token", "CDLP", 10000);
        expect(token.address).to.be.not.equal(AddressZero);
        expect(token.address).to.match(/0x[0-9a-fA-F]{40}/);

        // Send CryptoDev tokens to the users
        await token.transfer(user1.address, 500);
        await token.transfer(user2.address, 1000);
        await token.transfer(user3.address, 2000);
        console.log("User1 address, ETH and CryptoDev token balance: ", user1.address + ", " + await token.balanceOf(user1.address));
        console.log("User2 address, ETH and CryptoDev token balance: ", user2.address + ", " + await token.balanceOf(user2.address));
        console.log("User3 address, ETH and CryptoDev token balance: ", user3.address + ", " + await token.balanceOf(user3.address));

        const DexContract = await hre.ethers.getContractFactory("DEX");
        dex = await DexContract.deploy(token.address);
        console.log("DEX address: ", dex.address)
        expect(dex.address).to.be.not.equal(AddressZero);
        expect(dex.address).to.match((/0x[0-9a-fA-F]{40}/));
    });

    it("DEX receives cryptoDevToken from the users for the first time", async function () {
        const withdrawAmount = 100

        // User1 transfers ETH and CryptoDev token to DEX
        await token.connect(user1).approve(dex.address, withdrawAmount);
        await dex.connect(user1).addLiquidity(withdrawAmount, { value: 20 });

        // Check DEX reserves
        const dexReserve = await dex.getReserve();
        console.log("DEX cryptoDevToken reserve: " + dexReserve);
        console.log("DEX ETH reserve: " + await dex.provider.getBalance(dex.address));
        expect(dexReserve).to.be.equal(withdrawAmount);

        // Check user1 balance
        const user1LPTokenBalance = await dex.balanceOf(user1.address);
        console.log("User1 LP balance: ", user1LPTokenBalance);
        console.log("User1 CryptoDev balance: ", await token.balanceOf(user1.address));
    })


    it("DEX keeps the same ratio of the first deposit", async function () {
        const withdrawAmount = 110

        // User2 transfers ETH and CryptoDev token to DEX
        await token.connect(user2).approve(dex.address, withdrawAmount);
        await dex.connect(user2).addLiquidity(withdrawAmount, { value: 20 });

        // Check DEX reserves
        const dexReserve = await dex.getReserve();
        console.log("DEX cryptoDevToken reserve: " + dexReserve);
        console.log("DEX ETH reserve: " + await dex.provider.getBalance(dex.address));
        expect(dexReserve).to.be.equal(200);

        // Check user2 balance
        const user2LPTokenBalance = await dex.balanceOf(user2.address);
        console.log("User2 LP balance: ", user2LPTokenBalance);
        console.log("User2 CryptoDev balance: ", await token.balanceOf(user2.address));
    })

    it("DEX keeps the same ratio of the first deposit and user2 LP tokens increase", async function () {
        const withdrawAmount = 110

        // User2 transfers ETH and CryptoDev token to DEX
        await token.connect(user2).approve(dex.address, withdrawAmount);
        await dex.connect(user2).addLiquidity(withdrawAmount, { value: 20 });

        // Check DEX reserves
        const dexReserve = await dex.getReserve();
        console.log("DEX cryptoDevToken reserve: " + dexReserve);
        console.log("DEX ETH reserve: " + await dex.provider.getBalance(dex.address));
        expect(dexReserve).to.be.equal(300);

        // Check user2 balance
        const user2LPTokenBalance = await dex.balanceOf(user2.address);
        console.log("User2 LP balance: ", user2LPTokenBalance);
        console.log("User2 CryptoDev balance: ", await token.balanceOf(user2.address));
    })


    // FIXME: expect with error thrown doesn't work
    /* it("If DEX receives less CryptoDev Token than the initial ratio it must fail", async function () {
        const withdrawAmount = 60

        // User3 transfers ETH and CryptoDev token to DEX
        await token.connect(user3).approve(dex.address, withdrawAmount);
        expect(
            await dex.connect(user3).addLiquidity(withdrawAmount, { value: 20 })
        ).to.throw('Amount of tokens sent is less than the minimum tokens required');

        // Check DEX reserves
        const dexReserve = await dex.getReserve();
        console.log("DEX cryptoDevToken reserve: " + dexReserve);
        expect(dexReserve).to.be.equal(withdrawAmount);

        // Check user3 balance
        const user3LPTokenBalance = await dex.balanceOf(user3.address);
        console.log("User3 LP balance: ", user3LPTokenBalance);
        console.log("User3 CryptoDev balance: ", await token.balanceOf(user3.address));
    }) */

    it("User2 removes 10 LP token from DEX", async function () {
        const LPTokenWithdrawAmount = 10

        // User2 transfers ETH and CryptoDev token to DEX
        await token.connect(user2).approve(dex.address, LPTokenWithdrawAmount);
        await dex.connect(user2).removeLiquidity(LPTokenWithdrawAmount);

        // Check DEX reserves
        const dexReserve = await dex.getReserve();
        console.log("DEX cryptoDevToken reserve: " + dexReserve);
        expect(dexReserve).to.be.equal(250);
        const dexEthBalance = await dex.provider.getBalance(dex.address);
        console.log("DEX ETH reserve: " + dexEthBalance);
        expect(dexEthBalance).to.be.equal(50);

        // Check user2 balance
        const user2LPTokenBalance = await dex.balanceOf(user2.address);
        console.log("User2 LP balance: ", user2LPTokenBalance);
        expect(user2LPTokenBalance).to.be.equal(30);
        console.log("User2 CryptoDev balance: ", await token.balanceOf(user2.address));
    })

    it("User2 wants to know the amount of Eth/CryptoDev tokens that  would be returned in the swap", async function () {
        // await token.connect(user2).approve(dex.address, LPTokenWithdrawAmount);
        const tokenAmountToReceive = await dex.connect(user2).getAmountOfTokens(
            10, 40, 30
        );
        console.log("tokenAmountToReceive: ", tokenAmountToReceive)

        // Check DEX reserves
        const dexReserve = await dex.getReserve();
        console.log("DEX cryptoDevToken reserve: " + dexReserve);
        expect(dexReserve).to.be.equal(250);
        const dexEthBalance = await dex.provider.getBalance(dex.address);
        console.log("DEX ETH reserve: " + dexEthBalance);
        expect(dexEthBalance).to.be.equal(50);

        // Check user2 balance
        const user2LPTokenBalance = await dex.balanceOf(user2.address);
        console.log("User2 LP balance: ", user2LPTokenBalance);
        expect(user2LPTokenBalance).to.be.equal(30);
        console.log("User2 CryptoDev balance: ", await token.balanceOf(user2.address));
    })

    it("User2 swaps Eth for CryptoDev tokens", async function () {
        // await token.connect(user2).approve(dex.address, LPTokenWithdrawAmount);
        await dex.connect(user2).ethToCryptoDevToken(30, { value: 10 });

        // Check DEX reserves
        const dexReserve = await dex.getReserve();
        console.log("DEX cryptoDevToken reserve: " + dexReserve);
        expect(dexReserve).to.be.equal(209);
        const dexEthBalance = await dex.provider.getBalance(dex.address);
        console.log("DEX ETH reserve: " + dexEthBalance);
        expect(dexEthBalance).to.be.equal(60);

        // Check user2 balance
        const user2LPTokenBalance = await dex.balanceOf(user2.address);
        console.log("User2 LP balance: ", user2LPTokenBalance);
        expect(user2LPTokenBalance).to.be.equal(30);
        console.log("User2 CryptoDev balance: ", await token.balanceOf(user2.address));
    })

    it("User2 swaps CryptoDev tokens for Eth", async function () {
        // await token.connect(user2).approve(dex.address, LPTokenWithdrawAmount);
        await dex.connect(user2).cryptoDevTokenToEth(5, 1);

        // Check DEX reserves
        const dexReserve = await dex.getReserve();
        console.log("DEX cryptoDevToken reserve: " + dexReserve);
        expect(dexReserve).to.be.equal(214);
        const dexEthBalance = await dex.provider.getBalance(dex.address);
        console.log("DEX ETH reserve: " + dexEthBalance);
        expect(dexEthBalance).to.be.equal(59);

        // Check user2 balance
        const user2LPTokenBalance = await dex.balanceOf(user2.address);
        console.log("User2 LP balance: ", user2LPTokenBalance);
        expect(user2LPTokenBalance).to.be.equal(30);
        console.log("User2 CryptoDev balance: ", await token.balanceOf(user2.address));
    })
})