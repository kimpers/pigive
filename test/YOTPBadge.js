/* global assert, artifacts, contract, web3 */
const YOTPBadge = artifacts.require("./YOTPBadge.sol");

import truffleAssert from "truffle-assertions";

const MAX_SUPPLY = 2;

const SILVER_DONATION_AMOUNT = "100000000000000000";
const GOLD_DONATION_AMOUNT = "500000000000000000";

contract("YOTPBadge", accounts => {
  let badge;
  beforeEach(async () => {
    badge = await YOTPBadge.new(MAX_SUPPLY);
  });

  const [owner, nonOwner, ...otherAccounts] = accounts;

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
        "ipfshash",
        SILVER_DONATION_AMOUNT,
        "DogeCharity",
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
        badge.mintTo(owner, "ipfshash", SILVER_DONATION_AMOUNT, "DogeCharity", {
          from: nonOwner
        }),
        truffleAssert.ErrorType.REVERT
      );
    });

    it(`only allows maxSupply to be minted`, async () => {
      await truffleAssert.passes(
        badge.mintTo(
          nonOwner,
          "ipfshash",
          SILVER_DONATION_AMOUNT,
          "DogeCharity",
          {
            from: owner
          }
        )
      );

      await truffleAssert.passes(
        badge.mintTo(
          nonOwner,
          "ipfshash",
          SILVER_DONATION_AMOUNT,
          "DogeCharity",
          {
            from: owner
          }
        )
      );

      await truffleAssert.fails(
        badge.mintTo(
          nonOwner,
          "ipfshash",
          SILVER_DONATION_AMOUNT,
          "DogeCharity",
          {
            from: owner
          }
        ),
        truffleAssert.ErrorType.REVERT,
        "max supply reached"
      );
    });

    it("sets badge level gold for 0.5 eth donations", async () => {
      await badge.mintTo(
        nonOwner,
        "ipfshash",
        GOLD_DONATION_AMOUNT,
        "DogeCharity",
        { from: owner }
      );

      const results = await badge.badgeInfos.call(1);
      assert.equal(results.amount.toString(), GOLD_DONATION_AMOUNT);
      assert.equal(results.charityId, "DogeCharity");
      assert.equal(results.badgeLevel.toNumber(), 2);
    });

    it("sets badge level silver for 0.1 eth donations", async () => {
      await badge.mintTo(
        nonOwner,
        "ipfshash",
        SILVER_DONATION_AMOUNT,
        "DogeCharity",
        { from: owner }
      );

      const results = await badge.badgeInfos.call(1);
      assert.equal(results.amount.toString(), SILVER_DONATION_AMOUNT);
      assert.equal(results.charityId, "DogeCharity");
      assert.equal(results.badgeLevel.toNumber(), 1);
    });

    it("sets badge level bronze for any donation", async () => {
      await badge.mintTo(nonOwner, "ipfshash", 1, "DogeCharity", {
        from: owner
      });

      const results = await badge.badgeInfos.call(1);
      assert.equal(results.amount.toString(), 1);
      assert.equal(results.charityId, "DogeCharity");
      assert.equal(results.badgeLevel.toNumber(), 0);
    });
  });
});
