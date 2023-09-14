const fs = require('fs');
const { ethers } = require('hardhat');
async function main() {
  const [deployer, user1] = await ethers.getSigners();
  // We get the contract factory to deploy
  const DTavernFactory = await ethers.getContractFactory("DTavern");
  // Deploy contract
  const dtavern = await DTavernFactory.deploy();
  // Save contract address file in project
  const contractsDir = __dirname + "/../src/contractsData";
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/dtavern-address.json`,
    JSON.stringify({ address: dtavern.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync("DTavern");

  fs.writeFileSync(
    contractsDir + `/dtavern.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
  console.log("DTavern deployed to:", dtavern.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
