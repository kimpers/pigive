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
  });

  describe("donate", () => {
    it("allows a minimum donation of 0.008 ether", async () => {
      await truffleAssert.passes(
        donationsManager.donate(CHARITY_NAME, nonOwner, {
          from: nonOwner,
          value: web3.utils.toWei("0.008", "ether")
        })
      );
    });

    it("does not allow donation of less than 0.008 ether", async () => {
      await truffleAssert.fails(
        donationsManager.donate(CHARITY_NAME, nonOwner, {
          from: nonOwner,
          value: web3.utils.toWei("0.007", "ether")
        }),
        truffleAssert.ErrorType.REVERT,
        "0.008 ether min donation"
      );
    });

    it("allows non-owner to donate to charity and receive token", async () => {
      const charityPreDonationBalance = web3.utils.fromWei(
        await web3.eth.getBalance(charityAccount),
        "ether"
      );

      const results = await donationsManager.donate(CHARITY_NAME, nonOwner, {
        from: nonOwner,
        value: web3.utils.toWei("1", "ether")
      });
      const charityPostDonationBalance = web3.utils.fromWei(
        await web3.eth.getBalance(charityAccount),
        "ether"
      );

      await truffleAssert.passes(results);
      truffleAssert.eventEmitted(results, "LogDonation");

      assert.equal(
        charityPostDonationBalance - charityPreDonationBalance,
        1,
        "Charity receives donation funds"
      );

      const tokenOwner = await badge.ownerOf.call(1);
      assert.equal(tokenOwner, nonOwner);
    });

    it("allows non-owner to dondate to charity and send token to someone else", async () => {
      const charityPreDonationBalance = web3.utils.fromWei(
        await web3.eth.getBalance(charityAccount),
        "ether"
      );

      const otherAccount = otherAccounts[0];

      const results = await donationsManager.donate(
        CHARITY_NAME,
        otherAccount,
        {
          from: nonOwner,
          value: web3.utils.toWei("1", "ether")
        }
      );

      const charityPostDonationBalance = web3.utils.fromWei(
        await web3.eth.getBalance(charityAccount),
        "ether"
      );

      await truffleAssert.passes(results);
      truffleAssert.eventEmitted(results, "LogDonation");

      assert.equal(
        charityPostDonationBalance - charityPreDonationBalance,
        1,
        "Charity receives donation funds"
      );

      const tokenOwner = await badge.ownerOf.call(1);
      assert.equal(tokenOwner, otherAccount);
    });

    it("does not allow donations after max supply of badge has been reached", async () => {
      await truffleAssert.passes(
        donationsManager.donate(CHARITY_NAME, nonOwner, {
          from: nonOwner,
          value: web3.utils.toWei("1", "ether")
        })
      );

      assert.equal(await badge.ownerOf.call(1), nonOwner);

      await truffleAssert.passes(
        donationsManager.donate(CHARITY_NAME, otherAccounts[0], {
          from: nonOwner,
          value: web3.utils.toWei("1", "ether")
        })
      );

      assert.equal(await badge.ownerOf.call(2), otherAccounts[0]);

      await truffleAssert.fails(
        donationsManager.donate(CHARITY_NAME, nonOwner, {
          from: nonOwner,
          value: web3.utils.toWei("1", "ether")
        }),
        truffleAssert.ErrorType.REVERT,
        "max supply reached"
      );
    });
  });
});
