import React, { useState } from "react";
import styled from "styled-components";
import { isNil } from "ramda";
import idx from "idx";
import { DrizzleContext } from "drizzle-react";
import { toast } from "react-toastify";
import { Heading, Text, Input, Button, Select, Flex, Loader } from "rimble-ui";

import { device } from "../constants";

const FormSelect = styled(Select)`
  color: #333;
  width: 100%;

  :disabled {
    opacity: 0.7;
  }
`;

const FormWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding 15px;

  @media ${device.mobile} {
    background-color: #fff8f0;
  }

`;

const FormHeading = styled(Heading.h2)`
  text-align: center;
  padding-top: 10px;
  color: #333;
`;

const FormText = styled(Text.span)`
  color: #333;
  font-weight: bold;
  align-self: center;
  margin-bottom: 3px;
`;

const FormInput = styled(Input)`
  color: #333;

  :disabled {
    opacity: 0.7;
  }
`;

const DonateButton = styled(Button)`
  background-color: #d1ccc9;
  color: #333;
  width: 100%;
  margin-top: 10px;

  & > svg:last-child {
    margin-left: 0px;
  }

  :hover {
    background-color: white;
  }
`;

const ContentBox = styled.div`
  display: inline-block;
  align-self: center;
`;

const donationLevelMapping = {
  Gold: 0.888,
  Silver: 0.088,
  Bronze: 0.008
};

const filterActiveCharities = allEvents => {
  const charitiyAddedEvents = allEvents.filter(
    e => e.event === "LogCharityAdded"
  );
  const removedCharities = new Set(
    allEvents.filter(e => e.event === "LogCharityRemoved")
  );

  return charitiyAddedEvents
    .filter(e => !removedCharities.has(e.event))
    .map(c => c.returnValues);
};

const DonationForm = ({
  donationContract,
  currentAccount,
  toWei,
  drizzleState
}) => {
  const [charityName, setCharityName] = useState();
  const [donationLevel, setDonationLevel] = useState("Bronze");
  const [donationAmount, setDonationAmount] = useState(0.008);
  const [receiverAccount, setReceiverAccount] = useState(currentAccount);
  const [donationKey, setDonationKey] = useState();
  const [donationStatus, setDonationStatus] = useState();

  const donate = () => {
    const donationKey = donationContract.methods.donate.cacheSend(
      charityName,
      receiverAccount,
      { value: toWei(donationAmount) }
    );

    setDonationKey(donationKey);
  };

  const activeCharities = filterActiveCharities(
    drizzleState.contracts.Charities.events
  );
  if (activeCharities.length && !charityName) {
    setCharityName(activeCharities[0].name);
  }

  if (!isNil(donationKey)) {
    const donationTx = drizzleState.transactionStack[donationKey];
    const status = idx(drizzleState, _ => _.transactions[donationTx].status);

    if (donationStatus === "pending" && status === "success") {
      toast.success(`Donation successful!`);
    } else if (donationStatus === "pending" && status === "error") {
      toast.error("Something went wrong.");
    }

    if (donationStatus !== status) {
      setDonationStatus(status);
    }
  }

  const isPending = donationStatus === "pending";

  return (
    <FormWrapper>
      <ContentBox>
        <FormHeading>Donate to receive your collectible</FormHeading>
        <Flex flexDirection="column">
          <FormText>Charity to donate to</FormText>
          <FormSelect
            disabled={isPending}
            items={activeCharities.map(e => e.name)}
            value={charityName}
            onChange={e => setCharityName(e.target.value)}
          />
        </Flex>
        <Flex flexDirection="column">
          <FormText>Select donation level</FormText>
          <FormSelect
            disabled={isPending}
            items={["Bronze", "Silver", "Gold", "Custom"]}
            value={donationLevel}
            onChange={e => {
              const level = e.target.value;
              const amount = donationLevelMapping[level];

              setDonationLevel(level);
              if (amount && level !== "Custom") {
                setDonationAmount(amount);
              }
            }}
          />
        </Flex>
        <Flex flexDirection="column">
          <FormText>Amount (in ETH)</FormText>
          <FormInput
            type="number"
            step={0.01}
            value={donationAmount}
            onChange={e => setDonationAmount(e.target.value)}
            disabled={donationLevel !== "Custom" || isPending}
          />
        </Flex>
        <Flex flexDirection="column">
          <FormText>Token receiver address</FormText>
          <FormInput
            disabled={isPending}
            size="48"
            value={receiverAccount}
            onChange={e => setReceiverAccount(e.target.value)}
          />
        </Flex>
        <DonateButton
          disabled={isPending}
          icon={isPending ? null : "AttachMoney"}
          iconpos="right"
          onClick={donate}
        >
          {isPending ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                lineHeight: "40px"
              }}
            >
              <span style={{ marginRight: "10px" }}>Loading...</span>
              <Loader size="40px" />
            </div>
          ) : (
            <span>Claim Token</span>
          )}
        </DonateButton>
      </ContentBox>
    </FormWrapper>
  );
};

export default () => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { drizzle, drizzleState } = drizzleContext;
      const currentAccount = drizzleState.accounts[0];
      const toWei = amount =>
        drizzle.web3.utils.toWei(amount.toString(), "ether");

      return (
        <DonationForm
          donationContract={drizzle.contracts.DonationManager}
          drizzleState={drizzleState}
          currentAccount={currentAccount}
          toWei={toWei}
        />
      );
    }}
  </DrizzleContext.Consumer>
);
