/* global assert, artifacts, contract, web3 */
const YOTPBadge = artifacts.require("./YOTPBadge.sol");

import truffleAssert from "truffle-assertions";

const MAX_SUPPLY = 2;

const SILVER_DONATION_AMOUNT = web3.utils.toWei("0.088", "ether");
const GOLD_DONATION_AMOUNT = web3.utils.toWei("0.888", "ether");

const BRONZE_BADGE_HASH = "BRONZE";
const SILVER_BADGE_HASH = "SILVER";
const GOLD_BADGE_HASH = "GOLD";

const MESSAGE = "HELLO WORLD";

contract("YOTPBadge", accounts => {
  let badge;
  beforeEach(async () => {
    badge = await YOTPBadge.new(MAX_SUPPLY);
    await badge.setBadgeLevelURI(0, BRONZE_BADGE_HASH);
    await badge.setBadgeLevelURI(1, SILVER_BADGE_HASH);
    await badge.setBadgeLevelURI(2, GOLD_BADGE_HASH);
  });

  const [owner, nonOwner, charityAccount, ...otherAccounts] = accounts;

  describe("deploying contract", () => {
    it("does not allow 0 value max supply", async () => {
      await truffleAssert.fails(
        YOTPBadge.new(0),
        truffleAssert.ErrorType.REVERT,
        "requires positive max supply"
      );
    });
  });

  describe("minting", () => {
    it("allows owner to mint tokens", async () => {
      const result = await badge.mintTo(
        nonOwner,
        SILVER_DONATION_AMOUNT,
        MESSAGE,
        {
          from: owner
        }
      );

      truffleAssert.eventEmitted(
        result,
        "LogMinted",
        null,
        "Emits LogMinted event"
      );
    });

    it("does not allow non-owner to mint tokens", async () => {
      await truffleAssert.fails(
        badge.mintTo(owner, SILVER_DONATION_AMOUNT, MESSAGE, {
          from: nonOwner
        }),
        truffleAssert.ErrorType.REVERT
      );
    });

    it(`only allows maxSupply to be minted`, async () => {
      await truffleAssert.passes(
        badge.mintTo(nonOwner, SILVER_DONATION_AMOUNT, MESSAGE, {
          from: owner
        })
      );

      await truffleAssert.passes(
        badge.mintTo(nonOwner, SILVER_DONATION_AMOUNT, MESSAGE, {
          from: owner
        })
      );

      await truffleAssert.fails(
        badge.mintTo(nonOwner, SILVER_DONATION_AMOUNT, MESSAGE, {
          from: owner
        }),
        truffleAssert.ErrorType.REVERT,
        "max supply reached"
      );
    });

    it("sets badge level gold for 0.5 eth donations", async () => {
      const results = await badge.mintTo(
        nonOwner,
        GOLD_DONATION_AMOUNT,
        MESSAGE,
        {
          from: owner
        }
      );

      await truffleAssert.passes(results);

      truffleAssert.eventEmitted(
        results,
        "LogMinted",
        ev =>
          ev.id.toNumber() === 1 &&
          ev.owner === nonOwner &&
          ev.badgeLevel.toNumber() === 2 &&
          ev.tokenURI === GOLD_BADGE_HASH &&
          ev.message === MESSAGE &&
          ev.createdAt > 0,
        "LogMinted should be emitted with correct data"
      );

      const tokenURI = await badge.tokenURI.call(1);
      assert.equal(tokenURI, GOLD_BADGE_HASH);
    });

    it("sets badge level silver for 0.1 eth donations", async () => {
      const results = await badge.mintTo(
        nonOwner,
        SILVER_DONATION_AMOUNT,
        MESSAGE,
        {
          from: owner
        }
      );

      truffleAssert.passes(results);

      truffleAssert.eventEmitted(
        results,
        "LogMinted",
        ev =>
          ev.id.toNumber() === 1 &&
          ev.owner === nonOwner &&
          ev.badgeLevel.toNumber() === 1 &&
          ev.tokenURI === SILVER_BADGE_HASH &&
          ev.message === MESSAGE &&
          ev.createdAt > 0,
        "LogMinted should be emitted with correct data"
      );

      const tokenURI = await badge.tokenURI.call(1);
      assert.equal(tokenURI, SILVER_BADGE_HASH);
    });

    it("sets badge level bronze for any donation", async () => {
      const results = await badge.mintTo(nonOwner, 1, MESSAGE, {
        from: owner
      });

      truffleAssert.passes(results);

      truffleAssert.eventEmitted(
        results,
        "LogMinted",
        ev =>
          ev.id.toNumber() === 1 &&
          ev.owner === nonOwner &&
          ev.badgeLevel.toNumber() === 0 &&
          ev.tokenURI === BRONZE_BADGE_HASH &&
          ev.message === MESSAGE &&
          ev.createdAt > 0,
        "LogMinted should be emitted with correct data"
      );

      const tokenURI = await badge.tokenURI.call(1);
      assert.equal(tokenURI, BRONZE_BADGE_HASH);
    });
  });

  describe("Badge URI", () => {
    const URI = "hello_world";

    it("allows owner to set a badge level URI", async () => {
      await truffleAssert.passes(
        badge.setBadgeLevelURI(0, URI, { from: owner })
      );

      const results = await badge.getBadgeLevelURI.call(0);
      assert.equal(results, URI);
    });

    it("does not allow non-owner to set a badge level URI", async () => {
      await truffleAssert.fails(
        badge.setBadgeLevelURI(0, URI, { from: nonOwner }),
        truffleAssert.ErrorType.REVERT
      );
    });
  });
});
