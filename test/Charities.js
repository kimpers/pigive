/* global assert, artifacts, contract, web3 */
const Charities = artifacts.require("./Charities.sol");

import truffleAssert from "truffle-assertions";

contract("Charities", accounts => {
  let charities;
  beforeEach(async () => {
    charities = await Charities.new();
  });

  const [owner, nonOwner, ...otherAccounts] = accounts;

  describe("adding", () => {
    it("allows owner to add a charity", async () => {
      const result = await charities.addCharityEntry(
        "DogeCharity",
        otherAccounts[0],
        { from: owner }
      );

      truffleAssert.passes(result);

      truffleAssert.eventEmitted(result, "LogCharityAdded");
    });

    it("does not allow non-owner to add a charity", async () => {
      await truffleAssert.fails(
        charities.addCharityEntry("DogeCharity", otherAccounts[0], {
          from: nonOwner
        }),
        truffleAssert.ErrorType.REVERT
      );
    });
  });
  describe("removing", () => {
    it("allows owner to remove a charity", async () => {
      await truffleAssert.passes(
        charities.addCharityEntry("DogeCharity", otherAccounts[0], {
          from: owner
        })
      );

      const result = await charities.removeCharityEntry("DogeCharity", {
        from: owner
      });

      await truffleAssert.passes(result);
      await truffleAssert.eventEmitted(result, "LogCharityRemoved");
    });

    it("does not allow non-owner to remove a charity", async () => {
      await truffleAssert.passes(
        charities.addCharityEntry("DogeCharity", otherAccounts[0], {
          from: owner
        })
      );

      await truffleAssert.fails(
        charities.removeCharityEntry("DogeCharity", {
          from: nonOwner
        }),
        truffleAssert.ErrorType.REVERT
      );
    });
  });

  describe("getting", () => {
    it("allows anyone to get an entry that exits", async () => {
      await truffleAssert.passes(
        charities.addCharityEntry("DogeCharity", otherAccounts[0], {
          from: owner
        })
      );

      const result = await charities.getCharityByName.call("DogeCharity", {
        from: otherAccounts[1]
      });

      assert.equal(result, otherAccounts[0], "correct charity address");
    });

    it("does not allow getting entries that don't exist", async () => {
      await truffleAssert.passes(
        charities.addCharityEntry("DogeCharity", otherAccounts[0], {
          from: owner
        })
      );

      await truffleAssert.fails(
        charities.getCharityByName.call("FakeCharity", {
          from: otherAccounts[1]
        }),
        truffleAssert.ErrorType.REVERT
      );
    });
  });
});
