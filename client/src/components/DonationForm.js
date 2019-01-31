import React, { useState } from "react";
import styled from "styled-components";
import { DrizzleContext } from "drizzle-react";
import { Heading, Text, Input, Button, Select, Flex } from "rimble-ui";

import CharityDropDown from "./CharityDropDown";
import { device } from "../constants";

const FormSelect = styled(Select)`
  color: #333;
  width: 100%;
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

const DonationForm = ({ donationContract, currentAccount, toWei }) => {
  const [charityName, setCharityName] = useState();
  const [donationLevel, setDonationLevel] = useState("Bronze");
  const [donationAmount, setDonationAmount] = useState(0.008);
  const [receiverAccount, setReceiverAccount] = useState(currentAccount);
  const [donationProgressKey, setDonationProgressKey] = useState();

  const donate = () => {
    const progressKey = donationContract.methods.donate.cacheSend(
      charityName,
      receiverAccount,
      { value: toWei(donationAmount) }
    );
    // TODO: handle this with loader
    setDonationProgressKey(progressKey);
  };

  return (
    <FormWrapper>
      <ContentBox>
        <FormHeading>Donate to receive your collectible</FormHeading>
        <Flex flexDirection="column">
          <FormText>Charity to donate to</FormText>
          <CharityDropDown
            charityName={charityName}
            setCharityName={setCharityName}
          />
        </Flex>
        <Flex flexDirection="column">
          <FormText>Select donation level</FormText>
          <FormSelect
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
            disabled={donationLevel !== "Custom"}
          />
        </Flex>
        <Flex flexDirection="column">
          <FormText>Token receiver address</FormText>
          <FormInput
            size="48"
            value={receiverAccount}
            onChange={e => setReceiverAccount(e.target.value)}
          />
        </Flex>
        <DonateButton icon="AttachMoney" iconpos="right" onClick={donate}>
          Claim Token
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
          currentAccount={currentAccount}
          toWei={toWei}
        />
      );
    }}
  </DrizzleContext.Consumer>
);
