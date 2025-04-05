import { ethers } from "hardhat";
import { hashEndpointWithScope } from "@selfxyz/core";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const nonce = await ethers.provider.getTransactionCount(deployer.address);
  console.log("Account nonce:", nonce);
  
  const futureAddress = ethers.getCreateAddress({
    from: deployer.address,
    nonce: nonce
  });
  console.log("Calculated future contract address:", futureAddress);
  
  // For prod environment
  // const identityVerificationHub = "0x9AcA2112D34Ef021084264F6f5eef2a99a5bA7b1";
  // For staging environment
  const identityVerificationHub = "0x3e2487a250e2A7b56c7ef5307Fb591Cc8C83623D";

  const scope = hashEndpointWithScope("https://my-self-ticket-ethtaipei.vercel.app/api/verify", 'My-Self-Ticket');
  const attestationId = 1n;

  // For mainnet environment
  // const token = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
  // For staging environment
  // const token = "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B";

  const olderThanEnabled = false;
  const olderThan = 18n;
  const forbiddenCountriesEnabled = false;
  const forbiddenCountriesListPacked = [0n, 0n, 0n, 0n] as [bigint, bigint, bigint, bigint];
  const ofacEnabled = [false, false, false] as [boolean, boolean, boolean];
  
  const MySelfTicket = await ethers.getContractFactory("MySelfTicket");

  console.log("Deploying MySelfTicket...");
  const mySelfTicket = await MySelfTicket.deploy(
    identityVerificationHub,
    scope,
    attestationId,
    olderThanEnabled,
    olderThan,
    forbiddenCountriesEnabled,
    forbiddenCountriesListPacked,
    ofacEnabled
  );
  
  await mySelfTicket.waitForDeployment();
  
  const deployedAddress = await mySelfTicket.getAddress();
  console.log("MySelfTicket deployed to:", deployedAddress);
  
  console.log("To verify on Celoscan:");
  console.log(`npx hardhat verify --network alfajores ${deployedAddress} ${identityVerificationHub} ${scope} ${attestationId} ${olderThanEnabled} ${olderThan} ${forbiddenCountriesEnabled} "[${forbiddenCountriesListPacked.join(',')}]" "[${ofacEnabled.join(',')}]"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });