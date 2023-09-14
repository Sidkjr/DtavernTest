const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DTavern", function () {
  let dtavern
  let deployer, user1, user2, users
  let URI = "SampleURI"
  let postHash = "SampleHash"
  beforeEach(async () => {
    // Get signers from development accounts 
    [deployer, user1, user2, ...users] = await ethers.getSigners();
    // We get the contract factory to deploy the contract
    const DTavernFactory = await ethers.getContractFactory("DTavern");
    // Deploy contract
    dtavern = await DTavernFactory.deploy();
    // user1 mints an nfts 
    await dtavern.connect(user1).mint(URI)
  })
  describe('Deployment', async () => {
    it("Should track name and symbol", async function () {
      const nftName = "Decentratwitter"
      const nftSymbol = "DAPP"
      expect(await dtavern.name()).to.equal(nftName);
      expect(await dtavern.symbol()).to.equal(nftSymbol);
    });
  })
  describe('Minting NFTs', async () => {
    it("Should track each minted NFT", async function () {
      expect(await dtavern.tokenCount()).to.equal(1);
      expect(await dtavern.balanceOf(user1.address)).to.equal(1);
      expect(await dtavern.tokenURI(1)).to.equal(URI);
      // user2 mints an nft 
      await dtavern.connect(user2).mint(URI)
      expect(await dtavern.tokenCount()).to.equal(2);
      expect(await dtavern.balanceOf(user2.address)).to.equal(1);
      expect(await dtavern.tokenURI(2)).to.equal(URI);
    });
  })
  describe('Setting profiles', async () => {
    it("Should allow users to select which NFT they own to represent their profile", async function () {
      // user1 mints another nft
      await dtavern.connect(user1).mint(URI)
      // By default the users profile is set to their last minted nft.
      expect(await dtavern.profiles(user1.address)).to.equal(2);
      // user 1 sets profile to first minted nft
      await dtavern.connect(user1).setProfile(1)
      expect(await dtavern.profiles(user1.address)).to.equal(1);
      // FAIL CASE //
      // user 2 tries to set their profile to nft number 2 owned by user 1
      await expect(
        dtavern.connect(user2).setProfile(2)
      ).to.be.revertedWith("Must own the nft you want to select as your profile");
    });
  })
  describe('Uploading posts', async () => {
    it("Should track posts uploaded only by users who own an NFT", async function () {
      // user1 uploads a post
      await expect(dtavern.connect(user1).uploadPost(postHash))
        .to.emit(dtavern, "PostCreated")
        .withArgs(
          1,
          postHash,
          0,
          user1.address
        )
      const postCount = await dtavern.postCount()
      expect(postCount).to.equal(1);
      // Check from struct
      const post = await dtavern.posts(postCount)
      expect(post.id).to.equal(1)
      expect(post.hash).to.equal(postHash)
      expect(post.tipAmount).to.equal(0)
      expect(post.author).to.equal(user1.address)
      // FAIL CASE #1 //
      // user 2 tried to upload a post without owning an nft
      await expect(
        dtavern.connect(user2).uploadPost(postHash)
      ).to.be.revertedWith("Must own a dtavern nft to post");
      // FAIL CASE #2 //
      // user 1 tried to upload a post with an empty post hash.
      await expect(
        dtavern.connect(user1).uploadPost("")
      ).to.be.revertedWith("Cannot pass an empty hash");
    });
  })
  describe('Tipping posts', async () => {
    it("Should allow users to tip posts and track each posts tip amount", async function () {
      // user1 uploads a post
      await dtavern.connect(user1).uploadPost(postHash)
      // Track user1 balance before their post gets tipped
      const initAuthorBalance = await ethers.provider.getBalance(user1.address)
      // Set tip amount to 1 ether
      const tipAmount = ethers.utils.parseEther("1")
      // user2 tips user1's post
      await expect(dtavern.connect(user2).tipPostOwner(1, { value: tipAmount }))
        .to.emit(dtavern, "PostTipped")
        .withArgs(
          1,
          postHash,
          tipAmount,
          user1.address
        )
      // Check that tipAmount has been updated from struct
      const post = await dtavern.posts(1)
      expect(post.tipAmount).to.equal(tipAmount)
      // Check that user1 received funds
      const finalAuthorBalance = await ethers.provider.getBalance(user1.address)
      expect(finalAuthorBalance).to.equal(initAuthorBalance.add(tipAmount))
      // FAIL CASE #1 //
      // user 2 tries to tip a post that does not exist
      await expect(
        dtavern.connect(user2).tipPostOwner(2)
      ).to.be.revertedWith("Invalid post id");
      // FAIL CASE #2 //
      // user 1 tries to tip their own post
      await expect(
        dtavern.connect(user1).tipPostOwner(1)
      ).to.be.revertedWith("Cannot tip your own post");
    });
  })
  describe("Getter functions", function () {
    let ownedByUser1 = [1, 2]
    let ownedByUser2 = [3]
    beforeEach(async function () {
      // user 1 makes a post
      await dtavern.connect(user1).uploadPost(postHash)
      // user 1 mints another NFT
      await dtavern.connect(user1).mint(URI)
      // user 2 mints an NFT
      await dtavern.connect(user2).mint(URI)
      // user 2 makes a post
      await dtavern.connect(user2).uploadPost(postHash)
    })

    it("getAllPosts should fetch all the posts", async function () {
      const allPosts = await dtavern.getAllPosts()
      // Check that the length is correct
      expect(allPosts.length).to.equal(2)
    });
    it("getMyNfts should fetch all nfts the user owns", async function () {
      const user1Nfts = await dtavern.connect(user1).getMyNfts()
      expect(user1Nfts.length).to.equal(2)
      const user2Nfts = await dtavern.connect(user2).getMyNfts()
      expect(user2Nfts.length).to.equal(1)
    });
  });
});
