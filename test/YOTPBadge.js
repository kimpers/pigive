/* global assert, artifacts, contract, web3 */
const YOTPBadge = artifacts.require("./YOTPBadge.sol");

import truffleAssert from "truffle-assertions";

const MAX_SUPPLY = 2;

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
      const result = await badge.mintTo(nonOwner, "ipfshash", {
        from: owner
      });

      truffleAssert.eventEmitted(
        result,
        "LogMinted",
        null,
        "Emits LogMinted event"
      );
    });

    it("does not allow non-owner to mint tokens", async () => {
      await truffleAssert.fails(
        badge.mintTo(owner, "ipfshash", {
          from: nonOwner
        }),
        truffleAssert.ErrorType.REVERT
      );
    });

    it(`only allows maxSupply to be minted`, async () => {
      await truffleAssert.passes(
        badge.mintTo(nonOwner, "ipfshash", {
          from: owner
        })
      );

      await truffleAssert.passes(
        badge.mintTo(nonOwner, "ipfshash", {
          from: owner
        })
      );

      await truffleAssert.fails(
        badge.mintTo(nonOwner, "ipfshash", {
          from: owner
        }),
        truffleAssert.ErrorType.REVERT,
        "max supply reached"
      );
    });
  });
});
