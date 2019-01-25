const YOTPBadge = artifacts.require("./YOTPBadge.sol");
const Charities = artifacts.require("./Charities.sol");
const DonationManager = artifacts.require("./DonationManager.sol");

const BRONZE_BADGE_HASH = "QmSxYpNMndhe5dU9NL9T6i8NC71rJUBxeGC9FHxBjjRBp2";
const SILVER_BADGE_HASH = "QmXzyWg5p9gwY2RsTyucKXn6RA3XiJCf5tGJtoa6ohTp7A";
const GOLD_BADGE_HASH = "QmViLm7byhkc6DDQUjry8zqs8KfhtL1u7m7o5ETqpkTaHi";

const MAX_SUPPLY = process.env.MAX_SUPPLY || 10;

module.exports = async deployer => {
  await deployer.deploy(YOTPBadge, MAX_SUPPLY);
  const badge = await YOTPBadge.deployed();

  // Set IPFS hashes for badge icons
  await badge.setBadgeLevelURI(0, BRONZE_BADGE_HASH);
  await badge.setBadgeLevelURI(1, SILVER_BADGE_HASH);
  await badge.setBadgeLevelURI(2, GOLD_BADGE_HASH);

  await deployer.deploy(Charities);
  const charities = await Charities.deployed();
  // TODO: Add more initial Charities
  const charityList = [
    ["TheWaterProject", "0x69af4da2e11e7b8cf0dcb2c0facd280096d1c711"],
    ["InternetArchive", "0xFA8E3920daF271daB92Be9B87d9998DDd94FEF08"]
  ];

  for (const [name, address] of charityList) {
    await charities.addCharityEntry(name, address);
    console.log(`Added ${name} (${address})`);
  }

  await deployer.deploy(DonationManager, YOTPBadge.address, Charities.address);

  // Set DonationManager contract as owner of YOTPBadge
  // so that donate function is the only way to mint tokens
  await badge.transferOwnership(DonationManager.address);
};
