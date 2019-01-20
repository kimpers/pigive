/* global assert, artifacts, contract, web3 */
const YOTPBadge = artifacts.require("./YOTPBadge.sol");
const Charities = artifacts.require("./Charities.sol");
const DonationManager = artifacts.require("./DonationManager.sol");

import truffleAssert from "truffle-assertions";

const MAX_SUPPLY = 2;

const SILVER_DONATION_AMOUNT = "100000000000000000";
const GOLD_DONATION_AMOUNT = "500000000000000000";

const BRONZE_BADGE_HASH = "BRONZE";
const SILVER_BADGE_HASH = "SILVER";
const GOLD_BADGE_HASH = "GOLD";

const CHARITY_NAME = "DogeCharity";

contract("DonationManager", accounts => {
  const [owner, nonOwner, charityAccount, ...otherAccounts] = accounts;

  let badge;
  let charities;
  let donationsManager;
  beforeEach(async () => {
    badge = await YOTPBadge.new(MAX_SUPPLY);
    await badge.setBadgeLevelURI(0, BRONZE_BADGE_HASH);
    await badge.setBadgeLevelURI(1, SILVER_BADGE_HASH);
    await badge.setBadgeLevelURI(2, GOLD_BADGE_HASH);

    charities = await Charities.new();
    await charities.addCharityEntry(CHARITY_NAME, charityAccount);

    donationsManager = await DonationManager.new(
      badge.address,
      charities.address
    );

    // Allow donations manager to mint tokens as the owner
    await badge.transferOwnership(donationsManager.address);
    await charities.transferOwnership(donationsManager.address);
  });

  describe("donate", () => {
    it("allows non-owner to donate to charity and receive token", async () => {
      const results = await donationsManager.donate(CHARITY_NAME, nonOwner, {
        from: nonOwner,
        value: 1000
      });

      await truffleAssert.passes(results);
      truffleAssert.eventEmitted(results, "LogDonation");
      console.log(results);
      // TODO check that correct amount was actually transfered
    });

    it("allows non-owner to dondate to charity and send token to someone else", async () => {
      // TODO: implement
    });

    it("does not allow donations after max supply of badge has been reached", async () => {
      // TODO: implement
    });
  });
});
