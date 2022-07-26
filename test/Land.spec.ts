import { ethers } from "hardhat";
import { ethers as tsEthers } from "ethers";
import { expect } from "chai";
import { getEventData } from "./utils";
import { Land, Land__factory } from "../build/typechain";

let land: Land;
let deployer: tsEthers.Signer;
let owner1: tsEthers.Wallet;
let owner2: tsEthers.Wallet;

describe("Land Token", () => {
    const NAME = "Land";
    const SYMBOL = "LND";
    const COST = ethers.utils.parseEther("1");

	before(async () => {

		deployer = (await ethers.getSigners())[0];
		land = await new Land__factory(deployer).deploy(
			NAME,
            SYMBOL,
            COST
		);
		owner1 = new ethers.Wallet(
			"0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
			deployer.provider
		);

        owner2 = new ethers.Wallet(
			"0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
			deployer.provider
		);
		// Send ETH to owners from signer.
		await deployer.sendTransaction({
			to: owner1.address,
			value: ethers.utils.parseEther("1000")
		});
        await deployer.sendTransaction({
			to: owner2.address,
			value: ethers.utils.parseEther("1000")
		});
	});

    describe('Deployment', () => {
        it('Returns the contract name', async () => {
            const result = await land.name();
            expect(result).to.equal(NAME);
        })

        it('Returns the symbol', async () => {
            const result = await land.symbol();
            expect(result).to.equal(SYMBOL);
        })

        it('Returns the cost to mint', async () => {
            const result = await land.cost();
            expect(result.toString()).to.equal(COST);
        })

        it('Returns the max supply', async () => {
            const result = await land.maxSupply();
            expect(result.toString()).to.equal("5");
        })

        it('Returns the number of buildings/land available', async () => {
            const result = await land.getBuildings();
            expect(result.length).to.equal(5);
        })
    })

    describe('Minting', () => {
        describe('Success', () => {
            it('Updates the owner address', async () => {
                land.connect(owner1);
                const mint = await land.mint(1);
                console.log("here", mint);
                // const result = await land.ownerOf(1);
                // console.log(result);
                // expect(result).to.equal(owner1.address);
            })

            xit('Updates building details', async () => {
                const result = await land.getBuilding(1);
                expect(result.owner).to.equal(owner1.address);
            })
        })

        xdescribe('Failure', () => {
            it('Prevents mint with invalid ID', async () => {
                land.connect(owner1);
                const result = await land.mint(100);
                expect(result).to.be.revertedWith("Not enough ether sent");
            })

            it('Prevents minting if already owned', async () => {
                land.connect(owner1);
                await land.mint(1);
                land.connect(owner2);
                const result = await land.mint(1);
                expect(result).to.be.revertedWith("Land is already purchased");
            })
        })
    })

    xdescribe('Transfers', () => {
        describe('success', () => {
            beforeEach(async () => {
                land.connect(owner1);
                
                await land.mint(1);
                await land.approve(owner2.address, 1);
                land.connect(owner2);
                await land.transferFrom(owner1.address, owner2.address, 1);
            })

            it('Updates the owner address', async () => {
                const result = await land.ownerOf(1);
                expect(result).to.equal(owner2.address);
            })

            it('Updates building details', async () => {
                const result = await land.getBuilding(1);
                expect(result.owner).to.equal(owner2.address);
            })
        })

        describe('failure', () => {
            it('Prevents transfers without ownership', async () => {
                land.connect(owner2);
                const result = await land.transferFrom(owner1.address, owner2.address, 1);
                expect(result).to.be.revertedWith("You are not approved or the owner");
            })

            it('Prevents transfers without approval', async () => {
                land.connect(owner1);
                await land.mint(1);
                land.connect(owner2);
                const result = await land.transferFrom(owner1.address, owner2.address, 1);
                expect(result).to.be.revertedWith("You are not approved or the owner");
            })
        })
    })
});
