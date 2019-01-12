/* global assert, artifacts, contract, web3 */
const YOTPBadge = artifacts.require("./YOTPBadge.sol");

import truffleAssert from "truffle-assertions";

contract("YOTPBadge", accounts => {
  let badge;
  beforeEach(async () => {
    badge = await YOTPBadge.new(2);
  });

  const [owner, nonOwner, ...otherAccounts] = accounts;

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
});
