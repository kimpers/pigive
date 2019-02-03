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

const MESSAGE = "HELLO WORLD";

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
      const donationWei = web3.utils.toWei("0.008", "ether");

      const results = await donationsManager.donate(
        CHARITY_NAME,
        nonOwner,
        MESSAGE,
        {
          from: nonOwner,
          value: donationWei
        }
      );

      await truffleAssert.passes(results);

      truffleAssert.eventEmitted(
        results,
        "LogDonation",
        ev =>
          ev.tokenId.toNumber() === 1 &&
          ev.charityAddress === charityAccount &&
          ev.from === nonOwner &&
          ev.charityName === CHARITY_NAME &&
          ev.amount.toString() === donationWei.toString() &&
          ev.createdAt > 0,
        "LogDonation should be emitted with correct data"
      );
    });

    it("does not allow donation of less than 0.008 ether", async () => {
      await truffleAssert.fails(
        donationsManager.donate(CHARITY_NAME, nonOwner, MESSAGE, {
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

      const donationWei = web3.utils.toWei("1", "ether");

      const results = await donationsManager.donate(
        CHARITY_NAME,
        nonOwner,
        MESSAGE,
        {
          from: nonOwner,
          value: donationWei
        }
      );
      const charityPostDonationBalance = web3.utils.fromWei(
        await web3.eth.getBalance(charityAccount),
        "ether"
      );

      await truffleAssert.passes(results);

      truffleAssert.eventEmitted(
        results,
        "LogDonation",
        ev =>
          ev.tokenId.toNumber() === 1 &&
          ev.charityAddress === charityAccount &&
          ev.from === nonOwner &&
          ev.charityName === CHARITY_NAME &&
          ev.amount.toString() === donationWei.toString() &&
          ev.createdAt > 0,
        "LogDonation should be emitted with correct data"
      );

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

      const donationWei = web3.utils.toWei("1", "ether");

      const results = await donationsManager.donate(
        CHARITY_NAME,
        otherAccount,
        MESSAGE,
        {
          from: nonOwner,
          value: donationWei
        }
      );

      const charityPostDonationBalance = web3.utils.fromWei(
        await web3.eth.getBalance(charityAccount),
        "ether"
      );

      await truffleAssert.passes(results);

      truffleAssert.eventEmitted(
        results,
        "LogDonation",
        ev =>
          ev.tokenId.toNumber() === 1 &&
          ev.charityAddress === charityAccount &&
          ev.from === nonOwner &&
          ev.charityName === CHARITY_NAME &&
          ev.amount.toString() === donationWei.toString() &&
          ev.createdAt > 0,
        "LogDonation should be emitted with correct data"
      );

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
        donationsManager.donate(CHARITY_NAME, nonOwner, MESSAGE, {
          from: nonOwner,
          value: web3.utils.toWei("1", "ether")
        })
      );

      assert.equal(await badge.ownerOf.call(1), nonOwner);

      await truffleAssert.passes(
        donationsManager.donate(CHARITY_NAME, otherAccounts[0], MESSAGE, {
          from: nonOwner,
          value: web3.utils.toWei("1", "ether")
        })
      );

      assert.equal(await badge.ownerOf.call(2), otherAccounts[0]);

      await truffleAssert.fails(
        donationsManager.donate(CHARITY_NAME, nonOwner, MESSAGE, {
          from: nonOwner,
          value: web3.utils.toWei("1", "ether")
        }),
        truffleAssert.ErrorType.REVERT,
        "max supply reached"
      );
    });
  });

  describe("pausable", () => {
    it.skip("should allow owner to pause", async () => {});
    it.skip("should not nonOwner to pause", async () => {});
    it.skip("should not allow donations when paused", async () => {});
    it.skip("should allow owner to resume", async () => {});
    it.skip("should not allow nonOwner to resume", async () => {});
  });
});
